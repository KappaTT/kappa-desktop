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
  Header('Chapter', [
    Nav('Events', 'EventsStack'),
    Nav('Brothers', 'DirectoryStack'),
    Nav('Voting', 'VotingStack', true)
  ]),
  Header('Attendance', [Nav('Check In', 'CheckInStack'), Nav('Request Excuse', 'ExcuseStack')]),
  Header(
    'Admin',
    [
      Nav('Event Templates', 'TemplatesStack'),
      Nav('Study Abroad', 'StudyAbroadStack'),
      Nav('Point Requirements', 'PointRequirementsStack'),
      Nav('Voting Management', 'VotingManagementStack'),
      Nav('Chapter Settings', 'ChapterSettingsStack')
    ],
    true
  ),
  Nav('Profile', 'ProfileStack'),
  Nav('Sign Out', '')
];

export default SidebarLayout;
