# -*- coding: utf-8 -*-
"""Antigravity Granular Color Customizer - Universal Automated Installer"""
import os
import sys
import struct
import json
import shutil
import platform

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def get_default_asar_path():
    system = platform.system()
    if system == 'Windows':
        local_app = os.environ.get('LOCALAPPDATA', '')
        return os.path.join(local_app, 'Programs', 'antigravity', 'resources', 'app.asar')
    elif system == 'Darwin':
        return '/Applications/Antigravity.app/Contents/Resources/app.asar'
    elif system == 'Linux':
        candidates = [
            '/opt/Antigravity/resources/app.asar',
            os.path.expanduser('~/.local/share/antigravity/resources/app.asar')
        ]
        for c in candidates:
            if os.path.exists(c):
                return c
        return candidates[0]
    return None

def unpack_asar(asar_path, dest_dir):
    with open(asar_path, 'rb') as f:
        magic, header_size, payload_size, json_size = struct.unpack('<IIII', f.read(16))
        header_bytes = f.read(json_size)
        header_str = header_bytes.decode('utf-8')
        header = json.loads(header_str)
        base_offset = 16 + payload_size

        def extract_level(files_dict, current_path):
            os.makedirs(current_path, exist_ok=True)
            for name, meta in files_dict.items():
                target = os.path.join(current_path, name)
                if 'files' in meta:
                    extract_level(meta['files'], target)
                else:
                    offset = int(meta['offset'])
                    size = int(meta['size'])
                    f.seek(base_offset + offset)
                    data = f.read(size)
                    with open(target, 'wb') as out:
                        out.write(data)

        extract_level(header['files'], dest_dir)

def pack_asar(source_dir, output_asar):
    file_list = []
    def build_header(current_dir):
        files_obj = {}
        entries = sorted(os.listdir(current_dir))
        for entry in entries:
            full_path = os.path.join(current_dir, entry)
            if os.path.isdir(full_path):
                files_obj[entry] = {'files': build_header(full_path)}
            else:
                size = os.path.getsize(full_path)
                file_list.append((full_path, size))
                files_obj[entry] = {'size': size, 'offset': ''}
        return files_obj

    header_dict = {'files': build_header(source_dir)}
    current_offset = 0
    def assign_offsets(d):
        nonlocal current_offset
        for k, v in d.items():
            if 'files' in v:
                assign_offsets(v['files'])
            else:
                v['offset'] = str(current_offset)
                current_offset += v['size']
                
    assign_offsets(header_dict['files'])
    json_bytes = json.dumps(header_dict, separators=(',', ':')).encode('utf-8')
    json_size = len(json_bytes)
    pad_len = (4 - (json_size % 4)) % 4
    padded_json = json_bytes + (b'\x00' * pad_len)
    payload_size = 4 + len(padded_json)
    header_size = 4 + payload_size
    magic = 4
    
    with open(output_asar, 'wb') as out_f:
        out_f.write(struct.pack('<IIII', magic, header_size, payload_size, json_size))
        out_f.write(padded_json)
        for fpath, size in file_list:
            with open(fpath, 'rb') as in_f:
                out_f.write(in_f.read())

def main():
    print("=" * 65)
    print("  [+] Antigravity Granular Color Customizer (111 Themes Engine)")
    print("=" * 65)

    asar_path = get_default_asar_path()
    if not asar_path or not os.path.exists(asar_path):
        custom = input("Enter full path to app.asar: ").strip().strip('"').strip("'")
        if custom and os.path.exists(custom):
            asar_path = custom
        else:
            print("[!] Error: Could not find Antigravity app.asar file.")
            return

    print(f"[+] Target ASAR: {asar_path}")
    backup_path = asar_path + '.bak'
    if not os.path.exists(backup_path):
        print(f"[+] Creating initial backup: {backup_path}")
        shutil.copy2(asar_path, backup_path)
    else:
        print(f"[+] Existing backup detected at: {backup_path}")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    temp_dir = os.path.join(script_dir, '_temp_extracted')
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)

    print("[*] Unpacking app.asar...")
    unpack_asar(asar_path, temp_dir)

    # Copy src files into extracted dist/
    src_dir = os.path.join(script_dir, 'src')
    dist_dir = os.path.join(temp_dir, 'dist')
    os.makedirs(dist_dir, exist_ok=True)
    
    shutil.copy2(os.path.join(src_dir, 'customizer.js'), os.path.join(dist_dir, 'customizer.js'))
    shutil.copy2(os.path.join(src_dir, 'themes.json'), os.path.join(dist_dir, 'themes.json'))

    # Patch preload.js
    preload_file = os.path.join(dist_dir, 'preload.js')
    with open(preload_file, 'r', encoding='utf-8') as f:
        preload_content = f.read()

    # Clean old mod injection if present
    marker = "// ========================================================================="
    if marker in preload_content:
        preload_content = preload_content.split(marker)[0].rstrip()

    patch_include = "\n\n" + marker + "\n" + "require('./customizer.js');\n" + marker + "\n"
    with open(preload_file, 'w', encoding='utf-8') as f:
        f.write(preload_content + patch_include)
    print("[+] Patched preload.js with customizer engine")

    # Repack asar
    output_asar = os.path.join(script_dir, 'app_patched.asar')
    print("[*] Packing patched app.asar...")
    pack_asar(temp_dir, output_asar)

    try:
        shutil.copy2(output_asar, asar_path)
        print("\n[+] SUCCESS: Customizer successfully installed into Antigravity!")
        print("[!] Simply restart Antigravity or press Ctrl + R to enjoy your new themes.")
    except Exception as e:
        print(f"\n[!] Notice: Could not overwrite {asar_path} directly (Antigravity is running):")
        print(f"    {e}")
        print(f"    Please close Antigravity and copy '{output_asar}' to '{asar_path}' manually.")
    finally:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        if os.path.exists(output_asar):
            os.remove(output_asar)

if __name__ == '__main__':
    main()
