import { NativeTabs, Icon, Label, VectorIcon } from 'expo-router/unstable-native-tabs';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon
          sf="house.fill"
          androidSrc={<VectorIcon family={MaterialIcons} name="home" />}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="generate">
        <Label>Generate</Label>
        <Icon
          sf="sparkles"
          androidSrc={<VectorIcon family={MaterialIcons} name="auto-awesome" />}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="social">
        <Label>Social</Label>
        <Icon
          sf="person.2.fill"
          androidSrc={<VectorIcon family={MaterialIcons} name="people" />}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="account">
        <Label>Account</Label>
        <Icon
          sf="person.circle.fill"
          androidSrc={<VectorIcon family={MaterialIcons} name="account-circle" />}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
