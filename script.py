import os
import re
from shutil import copyfile  # For error handling in case of existing files

def modify_and_write_files(source_dir, target_dir):
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

modify_and_write_files("public/accordi/", "text_chords/")