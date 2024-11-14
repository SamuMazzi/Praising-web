import argparse
import json
import os
import re
import hashlib

parser = argparse.ArgumentParser(
                prog='Helper script Praising',
                description='Contains some utility functions to help with Praising project')

parser.add_argument('--chords-to-text', dest="chords_to_text", type=bool, default=False, help="This option will populate the folder 'text_chords' with all the lyrics of the chords file without chords")
parser.add_argument('--fix-service-worker', dest="fix_service_worker", action="store_true", default=False, help="This option will fix the service worker file to escape apostrophes in the name of the song")
parser.add_argument('--generate-revisions', dest="generate_revisions", action="store_true", default=False, help="Generate revisions for all files in the 'public' directory")

def modify_and_write_files(source_dir: str, target_dir: str):
    """
    Lists all files in a directory, reads them, applies modifications,
    and writes the modified content to a new file with a different extension.

    Args:
        source_dir (str): Path to the directory containing the files to modify.
        target_dir (str): Path to the directory where the modified files will be written.
        modification_func (function): Function that takes a string as input
                                       and returns the modified string.
    """

    for filename in os.listdir(source_dir):
        if os.path.isfile(os.path.join(source_dir, filename)):  # Check for actual files

            # Extract file extension without the dot (".")
            base, ext = os.path.splitext(filename)

            # Create target directory if it doesn't exist
            os.makedirs(target_dir, exist_ok=True)

            source_filepath = os.path.join(source_dir, filename)
            target_filepath = os.path.join(target_dir, f"{base}.txt")

            try:
                with open(source_filepath, 'r') as source_file, open(target_filepath, 'w') as target_file:
                    content = source_file.read()
                    new_content = re.sub("[\{\[].*?[\}\]]", "", content).strip()
                    new_content = new_content.replace("\nRit.\n", "").replace("\nRit. (2V)\n", "").replace("\nRit. (1V)\n", "").replace("\nRit. (4V)\n", "")
                    target_file.write(new_content)
                    print(f"Successfully modified and wrote '{filename}' to '{target_filepath}'")
            except IOError as e:
                print(f"Error processing '{filename}': {e}")

def fix_service_worker_name_chord_files(input_file: str):
    """Reads an input file, replaces occurrences of "'/accordi/<name_song>.crd'" with escaped apostrophes, and writes the modified content back to the file."""

    with open(input_file, 'r+') as file:
        content = file.read()

        # Regular expression to match the pattern with potential apostrophes in <name_song>
        pattern = r"/accordi/[^']*((?<!\\)')[^']*.crd"

        # Replace occurrences of the pattern, escaping apostrophes within <name_song>
        modified_content = re.sub(pattern, lambda match: match.group(0).replace("'", r"\'"), content)

        # Write the modified content back to the file
        file.seek(0)
        file.write(modified_content)
        file.truncate()

def generate_file_hash(filename: str):
    # Create a new sha256 hash object
    sha256_hash = hashlib.sha256()

    try:
        with open(filename, "rb") as f:
            # Read the file in chunks to handle large files efficiently
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except IOError:
        print(f"Error: Unable to read file '{filename}'")
        return None

def generate_revisions_pages():
    pages_to_be_cached: list[dict[str, str]] = [
        {
            "voice": "songs",
            "filename": "songs/index.tsx", 
            "hash": "",
        },
        {
            "voice": "contribute",
            "filename": "contribute.tsx", 
            "hash": "",
        },
        {
            "voice": "lectures",
            "filename": "lectures.tsx", 
            "hash": "",
        },
        {
            "voice": "index",
            "filename": "index.tsx", 
            "hash": "",
        },
        {
            "voice": "playlist",
            "filename": "playlist/index.tsx", 
            "hash": "",
        },
        {
            "voice": "feedback",
            "filename": "feedback.tsx", 
            "hash": "",
        },
        {
            "voice": "settings",
            "filename": "settings.tsx", 
            "hash": "",
        }
    ]
    dir_path = os.path.dirname(os.path.realpath(__file__))
    for info in pages_to_be_cached:        
        file_path = os.path.join(dir_path, "pages", info["filename"])
        
        info["hash"] = generate_file_hash(file_path)[:12]
        print(f"File: {info['filename']}")
        print(f"Hash: {info['hash']}")
    with open("info_revision.json", "w") as outfile: 
        json.dump(pages_to_be_cached, outfile)

if __name__ == "__main__":
    args = parser.parse_args()
    if args.chords_to_text:
        modify_and_write_files("public/accordi/", "text_chords/")
    if args.fix_service_worker:
        fix_service_worker_name_chord_files("public/sw.js")
    if args.generate_revisions:
        generate_revisions_pages()