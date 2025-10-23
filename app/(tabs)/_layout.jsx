import { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import {
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { DiaryProvider } from "../../context/diary-context";
import { useAuth } from "../../context/auth-context";

const ACTIVE_COLOR = "#FFA36C";
const INACTIVE_COLOR = "#7E7874";

const TAB_META = {
  home: { label: "Home", icon: "home" },
  diary: { label: "Diary", icon: "book" },
  profile: { label: "Profile", icon: "person" },
  settings: { label: "Settings", icon: "settings" },
};

const ICON_SIZE = 22;
const POST_BUTTON_SIZE = 56;
const NAV_VERTICAL_PADDING = 10;
const LABEL_TOP_MARGIN = 4;
const LABEL_LINE_HEIGHT = 14;
const NAV_HEIGHT =
  NAV_VERTICAL_PADDING * 2 + ICON_SIZE + LABEL_TOP_MARGIN + LABEL_LINE_HEIGHT;
const POST_BUTTON_BOTTOM_OFFSET = NAV_HEIGHT - POST_BUTTON_SIZE / 2;
function CustomTabBar({ state, descriptors, navigation, insets }) {
  const bottomInset = Math.max(insets.bottom, 8);
  const postIndex = state.routes.findIndex((route) => route.name === "post");
  const nonPostRoutes = state.routes.filter((route) => route.name !== "post");
  const leftRoutes = nonPostRoutes.slice(0, 2);
  const rightRoutes = nonPostRoutes.slice(2);

  const handlePress = (routeName, index) => {
    const event = navigation.emit({
      type: "tabPress",
      target: state.routes[index].key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const handleLongPress = (routeName, index) => {
    navigation.emit({
      type: "tabLongPress",
      target: state.routes[index].key,
    });
  };

  const renderRouteButton = (route) => {
    const routeIndex = state.routes.findIndex((item) => item.key === route.key);
    const isFocused = state.index === routeIndex;
    const { options } = descriptors[route.key];
    const { tabBarTestID } = options;
    const meta = TAB_META[route.name];
    const label =
      options.tabBarLabel ??
      options.title ??
      meta?.label ??
      route.name;
    const iconName = meta?.icon;
    const iconColor = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;

    const icon =
      iconName != null ? (
        <Ionicons
          name={iconName}
          size={ICON_SIZE}
          color={iconColor}
          style={styles.icon}
        />
      ) : (
        options.tabBarIcon?.({
          focused: isFocused,
          color: iconColor,
          size: ICON_SIZE,
        }) ?? null
      );

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={tabBarTestID}
        activeOpacity={0.85}
        onPress={() => handlePress(route.name, routeIndex)}
        onLongPress={() => handleLongPress(route.name, routeIndex)}
        style={styles.tabItem}
      >
        <View style={styles.iconContainer}>
          {icon}
          {typeof label === "string" ? (
            <Text
              style={[
                styles.label,
                { color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR },
                isFocused ? styles.labelVisible : styles.labelHidden,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const handlePostPress = () => {
    if (postIndex === -1) {
      return;
    }

    handlePress("post", postIndex);
  };

  const handlePostLongPress = () => {
    if (postIndex === -1) {
      return;
    }

    handleLongPress("post", postIndex);
  };

  return (
    <View
      style={[
        styles.tabBarWrapper,
        {
          paddingBottom: bottomInset,
        },
      ]}
    >
      <View style={styles.tabBar}>
        <View style={styles.sideGroup}>{leftRoutes.map(renderRouteButton)}</View>
        <View style={styles.postSpacer} />
        <View style={styles.sideGroup}>
          {rightRoutes.map(renderRouteButton)}
        </View>
      </View>

      {postIndex !== -1 ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Create post"
          activeOpacity={0.9}
          style={[
            styles.postButton,
            { bottom: bottomInset + POST_BUTTON_BOTTOM_OFFSET },
          ]}
          onPress={handlePostPress}
          onLongPress={handlePostLongPress}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const iconFor = (name) => ({ focused, color, size }) => (
  <Ionicons name={name} size={size} color={color} />
);

export default function TabsLayout() {
  const router = useRouter();
  const { isAuthenticated, initializing } = useAuth();

  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      router.replace("/login");
    }
  }, [initializing, isAuthenticated, router]);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ACTIVE_COLOR} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DiaryProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarLabel: TAB_META.home.label,
            tabBarIcon: iconFor(TAB_META.home.icon),
          }}
        />
        <Tabs.Screen
          name="diary"
          options={{
            tabBarLabel: TAB_META.diary.label,
            tabBarIcon: iconFor(TAB_META.diary.icon),
          }}
        />
        <Tabs.Screen
          name="post"
          options={{
            tabBarLabel: "Post",
            tabBarIcon: iconFor("add"),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarLabel: TAB_META.profile.label,
            tabBarIcon: iconFor(TAB_META.profile.icon),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarLabel: TAB_META.settings.label,
            tabBarIcon: iconFor(TAB_META.settings.icon),
          }}
        />
      </Tabs>
    </DiaryProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F4F1",
  },
  tabBarWrapper: {
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  tabBar: {
    marginHorizontal: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: NAV_VERTICAL_PADDING,
    borderTopWidth: 1,
    borderTopColor: "#ECE7E1",
  },
  sideGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    flex: 1,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
  },
  icon: {
    marginTop: 6,
  },
  labelVisible: {
    opacity: 1,
  },
  labelHidden: {
    opacity: 0,
  },
  postSpacer: {
    width: 80,
  },
  postButton: {
    position: "absolute",
    alignSelf: "center",
    width: POST_BUTTON_SIZE,
    height: POST_BUTTON_SIZE,
    borderRadius: POST_BUTTON_SIZE / 2,
    backgroundColor: ACTIVE_COLOR,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFA36C",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    ...Platform.select({
      android: {
        elevation: 8,
      },
    }),
  },
});
