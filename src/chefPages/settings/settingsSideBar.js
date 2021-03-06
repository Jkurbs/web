import * as React from "react";
import { Text, View, TouchableOpacity, Dimensions } from "react-native";
import { createSideTabNavigator } from "react-navigation-side-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import EditProfileScreen from './EditProfile/editProfile';
import ChangePasswordScreen from './Password/changePassword';
import BankAccountScreen from './bank/bankAccounts'
import OrderSettingsScreen from './OrderSettings/orderSettings';
import PreferenceScreen from './Preference/preference';


const { width: windowWidth, height: windowHeight } = Dimensions.get("screen");

const Tab = createSideTabNavigator();

const StackEditProfile = createStackNavigator();
const StackChangePassword = createStackNavigator();
const StackBankAccount = createStackNavigator();
const StackOrderSettings = createStackNavigator();
const StackPreference = createStackNavigator();


const navOptionHandler = () => ({
    headerShown: false,
    header: null,
});

function TabNavigator({ userData, localDarkToggle }) {

    var options = { weekday: "long", month: "long", day: "numeric" };
    var today = new Date();
    const todayDate = today.toLocaleDateString("en-US", options);
    return (
        <Tab.Navigator
            tabBarOptions={{
                activeTintColor: "#34C759",
                inactiveTintColor: "black",
                tabStyle: { marginBottom: 20 },
                style: {
                    width: 200,
                    paddingTop: 120,
                },
                iconHorizontal: true,
                labelSize: 13,
                showLabel: true,
                tabWidth: 200,
                headerStyle: {
                    backgroundColor: "#f4511e",
                },
            }}
        >
            <Tab.Screen
                options={{
                    title: "Edit Profile",
                    tabBarLabel: "Edit Profile",
                    headerTintColor: "#fff",
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                }}
                name="Edit Profile"
                component={EditProfileStack}
            />

            <Tab.Screen
                options={{
                    title: "Change Password",
                    tabBarLabel: "Change Password",
                    headerTintColor: "#fff",
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                }}
                name="Change password"
                component={ChangePasswordStack}
            />

            <Tab.Screen
                options={{
                    title: "Bank accounts",
                    tabBarLabel: "Bank accounts",
                    headerTintColor: "#fff",
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                }}
                name="Bank accounts"
                component={BankAccountsStack}
            />

            <Tab.Screen
                options={{
                    title: "Order settings",
                    tabBarLabel: "Order settings",
                    headerTintColor: "#fff",
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                }}
                name="Order settings"
                component={OrderSettingsStack}
            />

            {/* <Tab.Screen
                options={{
                    title: "Preferences",
                    tabBarLabel: "Preferences",
                    headerTintColor: "#fff",
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                }}
                name="Preferences"
                component={PreferenceStack}
                initialParams={{userData:userData,localDarkToggle:localDarkToggle}}
            /> */}
        </Tab.Navigator>
    );
}

// Stack to show EditProfile
function EditProfileStack({ userData }) {
    return (
        <StackEditProfile.Navigator initialRouteName="Edit Account">
            <StackEditProfile.Screen
                name="Edit Account"
                component={EditProfileScreen}
                options={navOptionHandler}
                initialParams={{ userData: userData }}
            />
        </StackEditProfile.Navigator>
    );
}

function ChangePasswordStack({ userData }) {
    return (
        <StackChangePassword.Navigator initialRouteName="Change Password">
            <StackChangePassword.Screen
                name="Change Password"
                component={ChangePasswordScreen}
                options={navOptionHandler}
                initialParams={{ userData: userData }}
            />
        </StackChangePassword.Navigator>
    );
}

// Stack to show bank accounts 
function BankAccountsStack({ userData }) {
    return (
        <StackBankAccount.Navigator initialRouteName="Bank accounts">
            <StackBankAccount.Screen
                name="Bank accounts"
                component={BankAccountScreen}
                options={navOptionHandler}
                initialParams={{ userData: userData }}
            />
        </StackBankAccount.Navigator>
    );
}

// Stack to show Order Settings
function OrderSettingsStack({ userData }) {
    return (
        <StackOrderSettings.Navigator initialRouteName="Order settings">
            <StackOrderSettings.Screen
                name="Order settings"
                component={OrderSettingsScreen}
                options={navOptionHandler}
                initialParams={{ userData: userData }}
            />
        </StackOrderSettings.Navigator>
    );
}

// Stack to show Preferences
function PreferenceStack({ route }) {
    const { userData, localDarkToggle } = route.params
    return (
        <StackPreference.Navigator initialRouteName="Preferences">
            <StackPreference.Screen
                name="Preferences"
                component={PreferenceScreen}
                options={navOptionHandler}
                initialParams={{ userData: userData, localDarkToggle: localDarkToggle }}
            />
        </StackPreference.Navigator>
    );
}

function Settings({ route }) {

    const phoneMaxWidth = 575.98
    const { navigation, userData } = route.params;
    const [localDark, setLocalDark] = React.useState(userData.user.isDarkMode)

    const localDarkToggle = (boolVal) => {
        setLocalDark(boolVal)
    }

    if (windowWidth < phoneMaxWidth) {
        return <MobileSettings />
    } else {
        return (
            <div className={localDark ? "darkWebDash" : "none"}>
                <WebSettings navigation={navigation} userData={userData} localDarkToggle={localDarkToggle} />
            </div>
        )
    }
}


function WebSettings({ navigation, userData, localDarkToggle }) {
    return (
        <View style={{ height: windowHeight, maxHeight: '100%' }}>
            <View style={{ flexDirection: 'column', position: "absolute", zIndex: 100, top: 30, left: 20 }}>
                <TouchableOpacity style={{ marginTop: 16, marginBottom: 20 }} onPress={() => navigation.navigate("Dashboard", navigation = { navigation })}>
                    <Text style={{ fontWeight: '500' }}>Back</Text>
                </TouchableOpacity>
            </View>
            < TabNavigator userData={userData} localDarkToggle={localDarkToggle} />
        </View>
    )
}

function MobileSettings() {
    return (
        <View style={{ borderRadius: 10, height: '100%', width: '80%', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 17, alignSelf: 'center' }}>Dashboard will soon be available on mobile.</Text>
        </View>
    )
}
export default Settings;
