import {prisma} from "./init";
import {Directory, Stat} from "../types/file-system";

export async function listDir(path: string): Promise<Stat[]> {
    const list = await prisma.path.findMany({
        where: {
            path
        }
    });
    const returned: Stat[] = [];
    for (const fileOrDir of list) {
        returned.push({
            atime: fileOrDir.atime,
            birthtime: fileOrDir.birthtime,
            blksize: fileOrDir.blksize,
            blocks: fileOrDir.blocks,
            ctime: fileOrDir.ctime,
            dev: fileOrDir.dev,
            gid: 1,
            ino: fileOrDir.ino,
            isDirectory(): boolean {
                return fileOrDir.directory;
            },
            mode: fileOrDir.mode,
            mtime: fileOrDir.mtime,
            name: fileOrDir.name,
            nlink: fileOrDir.nlink,
            rdev: fileOrDir.rdev,
            size: fileOrDir.size,
            uid: 1
        });
    }
    return returned;
}

export async function getFile(path: string, name: string, isStat = false): Promise<Directory | string> {
    const data = await prisma.path.findMany({
        select: {
            data: !isStat,
            directory: isStat
        },
        where: {
            path,
            name
        }
    });
    if (data.length >= 1) {
        if (!isStat) {
            return data[0].data;
        }
        return {
            directory: data[0].directory,
            isDirectory: () => data[0].directory
        };
    } else {
        return null;
    }
}

export async function deleteFile(path: string, name: string) {
    return prisma.path.deleteMany({
        where: {
            path,
            name
        }
    });
}

export async function createFile(stat: Stat, path, data) {
    const file = await getFile(path, stat.name);

    if (file != null) {
        return prisma.path.updateMany({
            where: {
                name: stat.name,
                path
            },
            data: {
                ctime: stat.ctime,
                mtime: stat.mtime,
                size: stat.size,
                data
            }
        });
    }
    return prisma.path.create({
        data: {
            atime: stat.atime,
            birthtime: stat.birthtime,
            blksize: stat.blksize,
            blocks: stat.blocks,
            ctime: stat.ctime,
            dev: stat.dev,
            ino: stat.ino,
            directory: stat.isDirectory(),
            mode: stat.mode,
            mtime: stat.mtime,
            name: stat.name,
            nlink: stat.nlink,
            rdev: stat.rdev,
            size: stat.size,
            path,
            data
        }
    });
}

export async function renameFile(pathData: string, from: string, to: string) {
    //const file = getFile(pathData, to);

    return prisma.path.updateMany({
        data: {
            name: to
        },
        where: {
            path: pathData,
            name: from
        }
    });
}