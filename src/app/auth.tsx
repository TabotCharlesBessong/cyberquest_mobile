import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Mascot } from "@/components/Mascot";
import { auth } from "@/lib/storage";
import { Brand, Spacing } from "@/constants/theme";

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const initialMode = params.mode === "login" ? "login" : "signup";

  const [mode, setMode] = useState<"signup" | "login">(initialMode);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit() {
    setError("");
    const trimmedName = name.trim();
    if (!trimmedName || !password) {
      setError("Please fill in your name and password.");
      return;
    }
    if (mode === "signup") {
      const parsedAge = parseInt(age, 10);
      if (!parsedAge || parsedAge < 4 || parsedAge > 18) {
        setError("Please enter your age (4–18).");
        return;
      }
      const user = auth.signUp(trimmedName, parsedAge, password);
      router.replace("/onboarding");
      return;
    }
    const user = auth.login(trimmedName, password);
    if (!user) {
      setError("Hmm, that name or password is not right. Try again!");
      return;
    }
    router.replace(user.onboarded ? "/(tabs)" : "/onboarding");
  }

  function switchMode() {
    setMode((m) => (m === "signup" ? "login" : "signup"));
    setError("");
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + Spacing.four },
        ]}
      >
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>

        <View style={styles.header}>
          <Mascot emoji={mode === "signup" ? "🦊" : "🦸"} size={84} />
          <Text style={styles.title}>
            {mode === "signup" ? "Create your hero" : "Welcome back!"}
          </Text>
          <Text style={styles.subtitle}>
            {mode === "signup"
              ? "Make an account to start your mission."
              : "Log in to continue your adventure."}
          </Text>
        </View>

        <View style={styles.form}>
          <Field label="Hero name">
            <TextInput
              style={styles.input}
              placeholder="e.g. Alex"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholderTextColor="#aab"
            />
          </Field>

          {mode === "signup" ? (
            <Field label="Your age">
              <TextInput
                style={styles.input}
                placeholder="6"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                placeholderTextColor="#aab"
              />
            </Field>
          ) : null}

          <Field label="Password">
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#aab"
            />
          </Field>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            label={mode === "signup" ? "Sign Up" : "Log In"}
            fullWidth
            onPress={submit}
          />
          <Pressable onPress={switchMode} style={styles.switchRow}>
            <Text style={styles.switchText}>
              {mode === "signup"
                ? "Already have an account? Log in"
                : "New here? Create an account"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1, backgroundColor: Brand.surface },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  back: { paddingVertical: Spacing.two },
  backText: { color: Brand.primary, fontSize: 16, fontWeight: "700" },
  header: { alignItems: "center", gap: Spacing.two, marginTop: Spacing.four },
  title: { fontSize: 28, fontWeight: "900", color: "#1c2742" },
  subtitle: { fontSize: 15, color: "#5b6478", textAlign: "center" },
  form: { marginTop: Spacing.five, gap: Spacing.four },
  field: { gap: Spacing.one },
  label: { fontSize: 14, fontWeight: "700", color: "#3a4560", marginLeft: 4 },
  inputWrap: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e2e8f4",
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 17,
    color: "#1c2742",
    borderRadius: 16,
  },
  error: {
    color: Brand.danger,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  switchRow: { alignItems: "center", marginTop: Spacing.two },
  switchText: { color: Brand.primary, fontSize: 15, fontWeight: "700" },
});
