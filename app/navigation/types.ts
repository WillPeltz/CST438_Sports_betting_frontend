// navigation/types.ts
export type RootStackParamList = {
    Home: undefined; // This is the Index screen
    Login: undefined;
    AccountCreation: undefined; // This is the AccountCreation screen
    Logout: undefined; // This is the logout screen
    FavoriteTeams: undefined;
  };

  export type RootStackScreenProps<T extends keyof RootStackParamList> = import('@react-navigation/stack').StackScreenProps<RootStackParamList, T>;
  