
export type Stat = {
    name: string,
    dev: number, // ID of the device containing the file.
    ino: number, // File inode number. An inode is a file system data structure that stores information about a file.
    mode: number, // File protection.
    nlink: number, // Number of hard links to the file.
    uid: number, // User ID of the file’s owner.
    gid: number, // Group ID of the file’s owner.
    rdev: number, // File inode number. An inode is a file system data structure that stores information about a file.
    size: number, // File total size in bytes.
    blksize: number, // Block size for file system I/O.
    blocks: number, // Number of blocks allocated for the file.
    atime: Date, // Date object representing the file’s last access time.
    mtime: Date, // Date object representing the file’s last modification time.
    ctime: Date, // Date object representing the last time the file’s inode was changed.
    birthtime: Date,
    isDirectory: () => boolean
}

export  type Directory = {
    directory: boolean,
    isDirectory: ()=> boolean
};