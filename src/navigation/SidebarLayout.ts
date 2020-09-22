export interface TSidebarElement {
  type: 'NAV' | 'DROP';
  label: string;
  target?: string;
  expanded?: boolean;
  children?: TSidebarElement[];
  privileged?: boolean;
}

const Header = (label: string, children: TSidebarElement[], privileged: boolean = false): TSidebarElement => ({
  type: 'DROP',
  label,
  target: null,
  expanded: true,
  children,
  privileged
});

const Nav = (label: string, target: string, privileged: boolean = false): TSidebarElement => ({
  type: 'NAV',
  label,
  target,
  children: null,
  privileged
});

const SidebarLayout: TSidebarElement[] = [
  Header('Chapter', [Nav('Events', 'Events'), Nav('Brothers', 'Directory'), Nav('Voting', '')]),
  Header('Attendance', [Nav('Check In', ''), Nav('Request Excuse', '')]),
  Header(
    'Admin',
    [
      // Nav('Event Templates', 'Event Templates'),
      // Nav('Study Abroad', 'Study Abroad'),
      // Nav('Brother Requirements', 'Brother Requirements'),
      Nav('Edit Candidates', 'Edit Candidates'),
      Nav('Voting Management', 'Voting Management')
      // Nav('Chapter Settings', 'Chapter Settings')
    ],
    true
  ),
  Nav('Profile', 'Profile'),
  Nav('Sign Out', '')
];

export default SidebarLayout;
