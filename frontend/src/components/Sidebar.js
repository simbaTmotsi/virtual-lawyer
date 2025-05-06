import { HomeIcon, BriefcaseIcon, UserGroupIcon, DocumentTextIcon, ClipboardDocumentCheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { CalendarIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Cases', href: '/cases', icon: BriefcaseIcon },
  { name: 'Clients', href: '/clients', icon: UserGroupIcon },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon }, // New calendar item
  { name: 'Documents', href: '/documents', icon: DocumentTextIcon },
  { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentCheckIcon },
  { name: 'Research', href: '/research', icon: MagnifyingGlassIcon },
];

export default navigation;