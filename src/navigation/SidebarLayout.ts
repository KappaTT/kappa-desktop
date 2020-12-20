export interface TSidebarElement {
  type: 'NAV' | 'DROP';
  label: string;
  routeName?: string;
  path?: string;
  expanded?: boolean;
  children?: TSidebarElement[];
  privileged?: boolean;
}

/**
 * Create a header element.
 */
const Header = (label: string, children: TSidebarElement[], privileged: boolean = false): TSidebarElement => ({
  type: 'DROP',
  label,
  routeName: null,
  path: null,
  expanded: true,
  children,
  privileged
});

/**
 * Create a nav element.
 */
const Nav = (label: string, routeName: string, path: string = null, privileged: boolean = false): TSidebarElement => ({
  type: 'NAV',
  label,
  routeName,
  path,
  children: null,
  privileged
});

/**
 * The sidebar configuration.
 */
const SidebarLayout: TSidebarElement[] = [
  Header('Chapter', [
    Nav('Events', 'Events', '/events'),
    Nav('Brothers', 'Directory', '/directory'),
    Nav('Voting', '')
  ]),
  Header('Attendance', [Nav('Check In', ''), Nav('Request Excuse', '')]),
  Header(
    'Admin',
    [
      // Nav('Event Templates', 'Event Templates'),
      // Nav('Study Abroad', 'Study Abroad'),
      // Nav('Brother Requirements', 'Brother Requirements'),
      Nav('Edit Candidates', 'Edit Candidates', '/edit-candidates'),
      Nav('Voting Management', 'Voting Management', '/voting-management')
      // Nav('Chapter Settings', 'Chapter Settings')
    ],
    true
  ),
  Nav('Profile', 'Profile', '/profile'),
  Nav('Sign Out', '')
];

export default SidebarLayout;
