import { format } from "date-fns";

export interface Category {
  id: string;
  name: string;
  enabled: boolean;
  extensions: string[];
  subfolders: boolean;
  smartCategorization?: boolean;
  duplicateDetection?: boolean;
}

export interface OrganizerConfig {
  sourcePath: string;
  destPath: string;
  categories: Category[];
  filters: {
    dateModified: "any" | "today" | "week" | "month" | "year";
    fileSize: "any" | "small" | "medium" | "large";
    excludeHidden: boolean;
  };
  conflictResolution: "rename" | "overwrite" | "skip" | "archive";
  schedule: {
    enabled: boolean;
    frequency: "manual" | "daily" | "weekly" | "monthly";
    date: Date | null;
    time: string; // "HH:MM"
  };
}

export const generatePythonScript = (config: OrganizerConfig): string => {
  const { sourcePath, destPath, categories, filters, conflictResolution, schedule } = config;

  // Generate the mapping dictionary for Python
  const mappingLines = categories
    .filter((c) => c.enabled)
    .flatMap((c) => {
      return c.extensions.map((ext) => {
        const cleanExt = ext.replace(/^\./, "").toLowerCase();
        return `    '.${cleanExt}': {'category': '${c.name}', 'subfolder': ${c.subfolders ? "True" : "False"}},`;
      });
    })
    .join("\n");

  const imports = [
    "# Install required packages: pip install schedule",
    "import os",
    "import shutil",
    "import time",
    "from datetime import datetime, timedelta",
    "from pathlib import Path",
    schedule.frequency !== "manual" ? "import schedule" : "",
  ].filter(Boolean).join("\n");

  const scheduleSetup = schedule.frequency !== "manual"
    ? `
def job():
    print(f"[{datetime.now()}] Starting scheduled cleanup...")
    organize_files()

# Schedule configuration
${getSchedulePythonCode(schedule.frequency, schedule.time)}

print(f"Scheduler started. Task will run {schedule.frequency} at {schedule.time}.")
while True:
    schedule.run_pending()
    time.sleep(60)
`
    : `
if __name__ == "__main__":
    organize_files()
`;

  // Filter logic
  let dateFilterCode = "";
  if (filters.dateModified !== "any") {
    const daysMap = { today: 1, week: 7, month: 30, year: 365 };
    const days = daysMap[filters.dateModified] || 0;
    dateFilterCode = `
            # Date modified filter
            mtime = os.path.getmtime(source_file)
            file_date = datetime.fromtimestamp(mtime)
            if (datetime.now() - file_date).days > ${days}:
                continue`;
  }

  let sizeFilterCode = "";
  if (filters.fileSize !== "any") {
    const MB = 1024 * 1024;
    if (filters.fileSize === "small") {
      // < 1MB
      sizeFilterCode = `
            # File size filter (< 1MB)
            if os.path.getsize(source_file) >= 1 * ${MB}:
                continue`;
    } else if (filters.fileSize === "medium") {
      // 1MB - 100MB
      sizeFilterCode = `
            # File size filter (1MB - 100MB)
            size = os.path.getsize(source_file)
            if size < 1 * ${MB} or size > 100 * ${MB}:
                continue`;
    } else if (filters.fileSize === "large") {
      // > 100MB
      sizeFilterCode = `
            # File size filter (> 100MB)
            if os.path.getsize(source_file) <= 100 * ${MB}:
                continue`;
    }
  }

  let hiddenFilterCode = "";
  if (filters.excludeHidden) {
    hiddenFilterCode = `
            # Exclude hidden files
            if filename.startswith('.'):
                continue`;
  }

  // Conflict resolution logic
  let conflictLogic = "";
  if (conflictResolution === "overwrite") {
    conflictLogic = `
                # Overwrite existing
                if os.path.exists(dest_file):
                    if os.path.isdir(dest_file):
                         shutil.rmtree(dest_file)
                    else:
                         os.remove(dest_file)
                shutil.move(source_file, dest_file)`;
  } else if (conflictResolution === "skip") {
    conflictLogic = `
                # Skip if exists
                if os.path.exists(dest_file):
                    print(f"Skipping {filename}, already exists.")
                    continue
                shutil.move(source_file, dest_file)`;
  } else {
    // Rename (Keep both)
    conflictLogic = `
                # Handle duplicates by renaming
                counter = 1
                base_name, file_ext = os.path.splitext(filename)
                while os.path.exists(dest_file):
                    dest_file = os.path.join(final_dest_dir, f"{base_name}_{counter}{file_ext}")
                    counter += 1
                shutil.move(source_file, dest_file)`;
  }

  return `${imports}

# Configuration
SOURCE_DIR = r"${sourcePath || "/Users/username/Desktop"}"
DEST_DIR = r"${destPath || "/Users/username/Documents/Organized"}"

def organize_files():
    if not os.path.exists(SOURCE_DIR):
        print(f"Source directory {SOURCE_DIR} does not exist.")
        return

    # Create destination directory if it doesn't exist
    if not os.path.exists(DEST_DIR):
        os.makedirs(DEST_DIR)

    # Extension mapping: extension -> { category, subfolder }
    extension_map = {
${mappingLines}
    }

    files_moved = 0
    print(f"Scanning {SOURCE_DIR}...")

    try:
        # Iterate over files in source directory
        for filename in os.listdir(SOURCE_DIR):
            source_file = os.path.join(SOURCE_DIR, filename)

            # Skip directories
            if not os.path.isfile(source_file):
                continue
${hiddenFilterCode}
${dateFilterCode}
${sizeFilterCode}

            # Get extension
            _, ext = os.path.splitext(filename)
            ext = ext.lower()

            if ext in extension_map:
                mapping = extension_map[ext]
                category = mapping['category']
                use_subfolder = mapping['subfolder']

                # Determine destination path
                dest_category_dir = os.path.join(DEST_DIR, category)
                
                if use_subfolder:
                    ext_folder = ext[1:] if ext.startswith('.') else ext
                    final_dest_dir = os.path.join(dest_category_dir, ext_folder)
                else:
                    final_dest_dir = dest_category_dir

                # Create directories
                if not os.path.exists(final_dest_dir):
                    os.makedirs(final_dest_dir)

                # Move file logic
                dest_file = os.path.join(final_dest_dir, filename)
                
                try:
${conflictLogic}
                    print(f"Moved: {filename} -> {final_dest_dir}")
                    files_moved += 1
                except Exception as e:
                    print(f"Error moving {filename}: {e}")
                    
    except Exception as e:
        print(f"An error occurred during organization: {e}")

    print(f"Organization complete. Moved {files_moved} files.")

${scheduleSetup}
`;
};

function getSchedulePythonCode(frequency: string, timeStr: string): string {
  const t = timeStr || "12:00";

  if (frequency === "daily") {
    return `schedule.every().day.at("${t}").do(job)`;
  } else if (frequency === "weekly") {
    return `schedule.every().monday.at("${t}").do(job) # Defaulting to Monday`;
  } else if (frequency === "monthly") {
    return `
def run_monthly():
    if datetime.now().day == 1:
        job()

schedule.every().day.at("${t}").do(run_monthly)`;
  } else {
    return `job() # Run once`;
  }
}