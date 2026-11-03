import * as React from "react";
import { SafeAreaView, Text, View, StyleSheet, useColorScheme } from "react-native";
import { ufNativeTokens } from "../../adapters/react-native/tokens.generated";

export default function App() {
  const dark = useColorScheme() === "dark";
  const colors = dark ? ufNativeTokens.darkColors : ufNativeTokens.colors;
  return (
    <SafeAreaView style={[styles.root, {backgroundColor: colors.canvas}]}>
      <View style={[styles.card, {backgroundColor: colors.surface}]}>
        <Text style={[styles.heading, {color: colors.text}]}>Universal Foundation CSS</Text>
        <Text style={[styles.body, {color: colors.textSecondary}]}>Generated native design tokens, not browser CSS.</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  root: {flex: 1, justifyContent: "center", padding: ufNativeTokens.space["4"]},
  card: {padding: ufNativeTokens.space["6"], borderRadius: ufNativeTokens.radius.lg},
  heading: {fontSize: ufNativeTokens.typography.bodySize * 1.25, fontWeight: "600", marginBottom: ufNativeTokens.space["3"]},
  body: {fontSize: ufNativeTokens.typography.bodySize, lineHeight: ufNativeTokens.typography.bodySize * ufNativeTokens.typography.bodyLineHeight},
});
