#!/usr/bin/env python3
"""
Load test for reading files
Reads files from 'files' folder multiple times and measures performance
"""

import os
import time
import sys
from pathlib import Path


def format_size(bytes_size):
    """Formats byte size to a readable representation"""
    for unit in ["B", "KB", "MB", "GB"]:
        if bytes_size < 1024.0:
            return f"{bytes_size:.2f} {unit}"
        bytes_size /= 1024.0
    return f"{bytes_size:.2f} TB"


def format_time(seconds):
    """Formats time in seconds to milliseconds if it's small"""
    if seconds < 1:
        return f"{seconds * 1000:.2f} ms"
    return f"{seconds:.2f} s"


def read_file_test(file_path, iterations=100):
    """
    Performs a file reading test

    Args:
        file_path: Path of the file to read
        iterations: Number of read iterations
    """
    print(f"\n{'=' * 60}")
    print(f"Load Test - File Reading")
    print(f"{'=' * 60}")
    print(f"File: {file_path}")

    # Verify that the file exists
    if not os.path.exists(file_path):
        print(f"❌ Error: The file does not exist")
        return

    # Get file information
    file_size = os.path.getsize(file_path)
    print(f"Size: {format_size(file_size)}")
    print(f"Iterations: {iterations}")
    print(f"\n{'=' * 60}")

    # Store read times
    read_times = []

    print("\nStarting read test...")

    for i in range(iterations):
        start_time = time.time()

        # Read the file
        with open(file_path, "rb") as f:
            data = f.read()

        end_time = time.time()
        elapsed = end_time - start_time
        read_times.append(elapsed)

        # Show progress every 10 iterations
        if (i + 1) % 10 == 0:
            print(f"  Progress: {i + 1}/{iterations} reads completed")

    # Calculate statistics
    total_time = sum(read_times)
    avg_time = total_time / len(read_times)
    min_time = min(read_times)
    max_time = max(read_times)

    # Calculate throughput
    total_bytes_read = file_size * iterations
    throughput_mb_s = (total_bytes_read / (1024 * 1024)) / total_time

    # Show results
    print(f"\n{'=' * 60}")
    print(f"TEST RESULTS")
    print(f"{'=' * 60}")
    print(f"Total reads:           {iterations}")
    print(f"Total bytes read:      {format_size(total_bytes_read)}")
    print(f"Total time:            {format_time(total_time)}")
    print(f"\nRead times:")
    print(f"  Average:             {format_time(avg_time)}")
    print(f"  Minimum:             {format_time(min_time)}")
    print(f"  Maximum:             {format_time(max_time)}")
    print(f"\nThroughput:")
    print(f"  {throughput_mb_s:.2f} MB/s")
    print(f"{'=' * 60}\n")


def main():
    """Main function"""
    # Configuration
    files_dir = "files"
    iterations = 100

    # Allow specifying number of iterations via parameter
    if len(sys.argv) > 1:
        try:
            iterations = int(sys.argv[1])
        except ValueError:
            print(
                f"⚠️  Warning: '{sys.argv[1]}' is not a valid number. Using {iterations} iterations."
            )

    # Search for files in the folder
    if not os.path.exists(files_dir):
        print(f"❌ Error: The folder '{files_dir}' does not exist")
        return

    files = list(Path(files_dir).glob("*"))
    files = [f for f in files if f.is_file()]

    if not files:
        print(f"❌ Error: There are no files in the folder '{files_dir}'")
        return

    print(f"\nFiles found in '{files_dir}':")
    for i, file in enumerate(files, 1):
        size = os.path.getsize(file)
        print(f"  {i}. {file.name} ({format_size(size)})")

    # Run test for each file
    for file_path in files:
        read_file_test(str(file_path), iterations)


if __name__ == "__main__":
    main()
