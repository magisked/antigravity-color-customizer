# -*- coding: utf-8 -*-
"""Antigravity Granular Color Customizer - 1-Click Uninstaller / Restore"""
import os
import sys
import shutil
import platform

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def main():
    print("[*] Antigravity Mod Uninstaller / Restore Tool")
    system = platform.system()
    if system == 'Windows':
        asar_path = os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Programs', 'antigravity', 'resources', 'app.asar')
    elif system == 'Darwin':
        asar_path = '/Applications/Antigravity.app/Contents/Resources/app.asar'
    else:
        asar_path = '/opt/Antigravity/resources/app.asar'

    backup_path = asar_path + '.bak'
    if not os.path.exists(backup_path):
        print(f"[!] No backup file found at: {backup_path}")
        return

    try:
        shutil.copy2(backup_path, asar_path)
        print(f"[+] Successfully restored original app.asar from {backup_path}!")
        print("[!] Restart Antigravity to revert all changes.")
    except Exception as e:
        print(f"[!] Error restoring backup: {e}")
        print("    Please close Antigravity and try again.")

if __name__ == '__main__':
    main()
