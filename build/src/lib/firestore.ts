// src/lib/firestore.ts
// Firebase has been completely removed.
// This file is a no-op stub kept so existing imports don't break.
// TODO: Replace any remaining imports from this file with the real API service.

export const useUserFolders = (_callback: (data: any[]) => void) => () => {};
export const useUserFiles = (_callback: (data: any[]) => void) => () => {};
export const useUserNotes = (_callback: (data: any[]) => void) => () => {};
export const useUserTeamMembers = (_callback: (data: any[]) => void) => () => {};

export const addFolder = async (_folderData: any) => {};
export const addFile = async (_name: string, _size: number, _folderId?: string) => {};
export const addNote = async (_title: string, _content?: string) => {};
export const addTeamMember = async (_memberData: any) => {};

export const serverTimestamp = () => new Date();
