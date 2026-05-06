import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../constants/colors';
import GoalScreen     from '../screens/GoalScreen';
import BsrScreen      from '../screens/BsrScreen';
import KeywordsScreen from '../screens/KeywordsScreen';
import NicheScreen    from '../screens/NicheScreen';
import MarketScreen   from '../screens/MarketScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Goal',     component: GoalScreen,     icon: '💰', label: 'Profit Goal' },
  { name: 'BSR',      component: BsrScreen,      icon: '📊', label: 'BSR Calc'    },
  { name: 'Keywords', component: KeywordsScreen, icon: '🔑', label: 'Keywords'    },
  { name: 'Niches',   component: NicheScreen,    icon: '🎯', label: 'Niches'      },
  { name: 'Market',   component: MarketScreen,   icon: '📈', label: 'Market'      },
];

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.navy,
          borderTopColor: COLORS.navyMid,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor:   COLORS.amber,
        tabBarInactiveTintColor: COLORS.light,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      }}
    >
      {TABS.map(t => (
        <Tab.Screen
          key={t.name}
          name={t.name}
          component={t.component}
          options={{
            tabBarLabel: t.label,
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>{t.icon}</Text>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
