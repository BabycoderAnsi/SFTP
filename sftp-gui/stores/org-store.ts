import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Organization } from '@/types';

interface OrgState {
  organizations: Organization[];
  selectedOrg: Organization | null;
  isLoading: boolean;
  
  setOrganizations: (orgs: Organization[]) => void;
  selectOrg: (org: Organization | null) => void;
  setLoading: (loading: boolean) => void;
  clearOrg: () => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      organizations: [],
      selectedOrg: null,
      isLoading: false,
      
      setOrganizations: (orgs) => set({ organizations: orgs }),
      
      selectOrg: (org) => set({ selectedOrg: org }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      clearOrg: () => set({ 
        organizations: [], 
        selectedOrg: null,
      }),
    }),
    {
      name: 'sftp-org',
      partialize: (state) => ({
        selectedOrg: state.selectedOrg,
      }),
    }
  )
);

export const getOrgPath = (path: string, org: Organization | null): string => {
  if (!org) return path;
  const orgPrefix = `/${org.username}`;
  
  if (path.startsWith(orgPrefix)) {
    return path;
  }
  
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${orgPrefix}${normalizedPath}`;
};
