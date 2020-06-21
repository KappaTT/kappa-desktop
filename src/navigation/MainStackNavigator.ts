import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import {
  ChapterSettingsScreen,
  DirectoryScreen,
  EventsScreen,
  EventTemplatesScreen,
  LoginScreen,
  MessagesScreen,
  PointRequirementsScreen,
  ProfileScreen,
  StudyAbroadScreen,
  VotingManagementScreen,
  VotingScreen
} from '@screens';

const LoginStack = createStackNavigator(
  {
    Login: {
      screen: LoginScreen,
      navigationOptions: ({ navigation }) => ({
        header: null,
        headerStyle: {
          height: 0
        }
      })
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarVisible: false
    })
  }
);

const MessagesStack = createStackNavigator(
  {
    Messages: {
      screen: MessagesScreen,
      navigationOptions: ({ navigation }) => ({
        header: null,
        headerStyle: {
          height: 0
        }
      })
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarVisible: false
    })
  }
);

const EventsStack = createStackNavigator(
  {
    Events: {
      screen: EventsScreen,
      navigationOptions: ({ navigation }) => ({
        header: null,
        headerStyle: {
          height: 0
        }
      })
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarVisible: false
    })
  }
);

const DirectoryStack = createStackNavigator(
  {
    Directory: {
      screen: DirectoryScreen,
      navigationOptions: ({ navigation }) => ({
        header: null,
        headerStyle: {
          height: 0
        }
      })
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarVisible: false
    })
  }
);

const VotingStack = createStackNavigator(
  {
    Voting: {
      screen: VotingScreen,
      navigationOptions: ({ navigation }) => ({
        header: null,
        headerStyle: {
          height: 0
        }
      })
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarVisible: false
    })
  }
);

const EventTemplatesStack = createStackNavigator(
  {
    EventTemplates: {
      screen: EventTemplatesScreen,
      navigationOptions: ({ navigation }) => ({
        header: null,
        headerStyle: {
          height: 0
        }
      })
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarVisible: false
    })
  }
);

const StudyAbroadStack = createStackNavigator(
  {
    StudyAbroad: {
      screen: StudyAbroadScreen,
      navigationOptions: ({ navigation }) => ({
        header: null,
        headerStyle: {
          height: 0
        }
      })
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarVisible: false
    })
  }
);

const PointRequirementsStack = createStackNavigator(
  {
    PointRequirements: {
      screen: PointRequirementsScreen,
      navigationOptions: ({ navigation }) => ({
        header: null,
        headerStyle: {
          height: 0
        }
      })
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarVisible: false
    })
  }
);

const VotingManagementStack = createStackNavigator(
  {
    VotingManagement: {
      screen: VotingManagementScreen,
      navigationOptions: ({ navigation }) => ({
        header: null,
        headerStyle: {
          height: 0
        }
      })
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarVisible: false
    })
  }
);

const ChapterSettingsStack = createStackNavigator(
  {
    ChapterSettings: {
      screen: ChapterSettingsScreen,
      navigationOptions: ({ navigation }) => ({
        header: null,
        headerStyle: {
          height: 0
        }
      })
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarVisible: false
    })
  }
);

const ProfileStack = createStackNavigator(
  {
    Profile: {
      screen: ProfileScreen,
      navigationOptions: ({ navigation }) => ({
        header: null,
        headerStyle: {
          height: 0
        }
      })
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarVisible: false
    })
  }
);

export default createBottomTabNavigator({
  LoginStack,
  MessagesStack,
  EventsStack,
  DirectoryStack,
  VotingStack,
  EventTemplatesStack,
  StudyAbroadStack,
  PointRequirementsStack,
  VotingManagementStack,
  ChapterSettingsStack,
  ProfileStack
});
