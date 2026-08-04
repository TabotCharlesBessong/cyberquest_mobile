import React, { type ReactNode, useState, createContext, useContext } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  FlatList,
} from "react-native";

import { Brand, Primary, Spacing } from "@/constants/theme";

type FormMethods = {
  control: Control<FieldValues>;
  handleSubmit: (...args: any[]) => any;
  reset: (...args: any[]) => any;
  getValues: (...args: any[]) => any;
  setValue: (...args: any[]) => any;
  formState: { errors: any };
  watch: (...args: any[]) => any;
};

const FormContext = createContext<FormMethods | null>(null);

export function FormProvider({
  form,
  children,
}: {
  form: FormMethods;
  children: ReactNode;
}) {
  return <FormContext.Provider value={form}>{children}</FormContext.Provider>;
}

export function useForm() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("useForm must be used within a FormProvider");
  return ctx;
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

export function FormLabel({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <Text style={styles.label}>
      {children}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  );
}

type FormInputProps = {
  label: string;
  name: Path<FieldValues>;
  control?: Control<FieldValues>;
  secureTextEntry?: boolean;
  keyboardType?:
    | "default"
    | "email-address"
    | "number-pad"
    | "phone-pad"
    | "numeric";
  autoCapitalize?: "none" | "words" | "sentences" | "characters";
  autoComplete?:
    | "email"
    | "current-password"
    | "sms-otp"
    | "tel"
    | "name"
    | "username";
  autoCorrect?: boolean;
  placeholder?: string;
  maxLength?: number;
  textContentType?:
    | "none"
    | "emailAddress"
    | "password"
    | "oneTimeCode"
    | "telephoneNumber"
    | "name"
    | "username";
  editable?: boolean;
  required?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: any;
  rules?: RegisterOptions<FieldValues, Path<FieldValues>>;
};

export function FormInput({
  label,
  name,
  control,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  autoCorrect,
  placeholder,
  maxLength,
  textContentType,
  editable = true,
  required,
  leftIcon,
  rightIcon,
  containerStyle,
  rules,
}: FormInputProps) {
  const form = useForm();
  const controlInstance = control ?? form.control;
  const error = (form.formState.errors as any)[name]?.message as
    | string
    | undefined;

  return (
    <View style={[styles.field, containerStyle]}>
      <FormLabel required={required}>{label}</FormLabel>
      <Controller
        control={controlInstance}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <View
            style={[
              styles.inputWrap,
              !editable && styles.inputDisabled,
              error && styles.inputError,
            ]}
          >
            {leftIcon}
            <TextInput
              style={[
                styles.input,
                !!leftIcon && styles.inputWithLeft,
                !!rightIcon && styles.inputWithRight,
              ]}
              value={(value as string) ?? ""}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              autoComplete={autoComplete}
              autoCorrect={autoCorrect}
              placeholder={placeholder}
              maxLength={maxLength}
              textContentType={textContentType}
              editable={editable}
              placeholderTextColor="#aab"
            />
            {rightIcon}
          </View>
        )}
      />
      {error && <FormError message={error} />}
    </View>
  );
}

export function FormPasswordInput({
  label,
  name,
  control,
  placeholder,
  required,
  containerStyle,
  rules,
}: {
  label: string;
  name: Path<FieldValues>;
  control?: Control<FieldValues>;
  placeholder?: string;
  required?: boolean;
  containerStyle?: any;
  rules?: RegisterOptions<FieldValues, Path<FieldValues>>;
}) {
  const form = useForm();
  const controlInstance = control ?? form.control;
  const [visible, setVisible] = useState(false);
  const error = (form.formState.errors as any)[name]?.message as
    | string
    | undefined;

  return (
    <View style={[styles.field, containerStyle]}>
      <FormLabel required={required}>{label}</FormLabel>
      <Controller
        control={controlInstance}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={[styles.passwordWrap, error && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              value={(value as string) ?? ""}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={!visible}
              placeholder={placeholder}
              placeholderTextColor="#aab"
              autoComplete="current-password"
              autoCorrect={false}
            />
            <Pressable
              onPress={() => setVisible((v) => !v)}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeText}>{visible ? "🙈" : "👁️"}</Text>
            </Pressable>
          </View>
        )}
      />
      {error && <FormError message={error} />}
    </View>
  );
}

export function FormCodeInput({
  label,
  name,
  control,
  length = 6,
  required,
  containerStyle,
  rules,
}: {
  label: string;
  name: Path<FieldValues>;
  control?: Control<FieldValues>;
  length?: number;
  required?: boolean;
  containerStyle?: any;
  rules?: RegisterOptions<FieldValues, Path<FieldValues>>;
}) {
  const form = useForm();
  const controlInstance = control ?? form.control;
  const error = (form.formState.errors as any)[name]?.message as
    | string
    | undefined;

  return (
    <View style={[styles.field, containerStyle]}>
      <FormLabel required={required}>{label}</FormLabel>
      <Controller
        control={controlInstance}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.codeInput, error && styles.inputError]}
            value={(value as string) ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="number-pad"
            maxLength={length}
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            placeholder="123456"
            placeholderTextColor="#aab"
          />
        )}
      />
      {error && <FormError message={error} />}
    </View>
  );
}

export function FormTextArea({
  label,
  name,
  control,
  placeholder,
  maxLength,
  required,
  autoCapitalize = "sentences",
  autoCorrect = true,
  containerStyle,
  rules,
}: {
  label: string;
  name: Path<FieldValues>;
  control?: Control<FieldValues>;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  autoCapitalize?: "none" | "words" | "sentences" | "characters";
  autoCorrect?: boolean;
  containerStyle?: any;
  rules?: RegisterOptions<FieldValues, Path<FieldValues>>;
}) {
  const form = useForm();
  const controlInstance = control ?? form.control;
  const [height, setHeight] = useState(100);
  const error = (form.formState.errors as any)[name]?.message as
    | string
    | undefined;

  return (
    <View style={[styles.field, containerStyle]}>
      <FormLabel required={required}>{label}</FormLabel>
      <Controller
        control={controlInstance}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.textArea,
              error && styles.inputError,
              { height: Math.max(100, height) },
            ]}
            value={(value as string) ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor="#aab"
            multiline
            textAlignVertical="top"
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            maxLength={maxLength}
            onContentSizeChange={(e) =>
              setHeight(e.nativeEvent.contentSize.height)
            }
          />
        )}
      />
      {error && <FormError message={error} />}
    </View>
  );
}

type FormSelectOption = { label: string; value: string | number };

export function FormSelect({
  label,
  name,
  control,
  options,
  placeholder = "Select an option",
  required,
  containerStyle,
  rules,
}: {
  label: string;
  name: Path<FieldValues>;
  control?: Control<FieldValues>;
  options: FormSelectOption[];
  placeholder?: string;
  required?: boolean;
  containerStyle?: any;
  rules?: RegisterOptions<FieldValues, Path<FieldValues>>;
}) {
  const form = useForm();
  const controlInstance = control ?? form.control;
  const [open, setOpen] = useState(false);
  const error = (form.formState.errors as any)[name]?.message as
    | string
    | undefined;
  const value =
    (form.watch(name) as string | number | undefined) ??
    (form.getValues() as any)?.[name];

  const selected = options.find((o) => o.value === value);

  return (
    <View style={[styles.field, containerStyle]}>
      <FormLabel required={required}>{label}</FormLabel>
      <Controller
        control={controlInstance}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur } }) => (
          <>
            <Pressable
              style={[styles.selectTrigger, error && styles.inputError]}
              onPress={() => setOpen(true)}
            >
              <Text
                style={[
                  styles.selectText,
                  !selected && styles.selectPlaceholder,
                ]}
              >
                {selected ? selected.label : placeholder}
              </Text>
              <Text style={styles.selectArrow}>▾</Text>
            </Pressable>
            <Modal
              visible={open}
              transparent
              animationType="fade"
              onRequestClose={() => setOpen(false)}
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setOpen(false)}
              >
                <Pressable style={styles.modalContent}>
                  <Text style={styles.modalTitle}>{label}</Text>
                  <FlatList
                    data={options}
                    keyExtractor={(item) => String(item.value)}
                    renderItem={({ item }) => (
                      <Pressable
                        style={[
                          styles.modalItem,
                          item.value === value && styles.modalItemSelected,
                        ]}
                        onPress={() => {
                          onChange(item.value);
                          setOpen(false);
                          onBlur();
                        }}
                      >
                        <Text
                          style={[
                            styles.modalItemText,
                            item.value === value &&
                              styles.modalItemTextSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {item.value === value && (
                          <Text style={styles.modalCheck}>✓</Text>
                        )}
                      </Pressable>
                    )}
                  />
                  <Pressable
                    onPress={() => setOpen(false)}
                    style={styles.modalClose}
                  >
                    <Text style={styles.modalCloseText}>Cancel</Text>
                  </Pressable>
                </Pressable>
              </Pressable>
            </Modal>
          </>
        )}
      />
      {error && <FormError message={error} />}
    </View>
  );
}

export function FormRadioGroup({
  label,
  name,
  control,
  options,
  required,
  containerStyle,
  rules,
}: {
  label: string;
  name: Path<FieldValues>;
  control?: Control<FieldValues>;
  options: FormSelectOption[];
  required?: boolean;
  containerStyle?: any;
  rules?: RegisterOptions<FieldValues, Path<FieldValues>>;
}) {
  const form = useForm();
  const controlInstance = control ?? form.control;
  const error = (form.formState.errors as any)[name]?.message as
    | string
    | undefined;
  const value =
    (form.watch(name) as string | number | undefined) ??
    (form.getValues() as any)?.[name];

  return (
    <View style={[styles.field, containerStyle]}>
      <FormLabel required={required}>{label}</FormLabel>
      <Controller
        control={controlInstance}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur } }) => (
          <View style={styles.radioGroup}>
            {options.map((option) => {
              const selected = value === option.value;
              return (
                <Pressable
                  key={String(option.value)}
                  style={[
                    styles.radioItem,
                    selected && styles.radioItemSelected,
                  ]}
                  onPress={() => {
                    onChange(option.value);
                    onBlur();
                  }}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      selected && styles.radioCircleSelected,
                    ]}
                  >
                    {selected && <View style={styles.radioDot} />}
                  </View>
                  <Text
                    style={[
                      styles.radioLabel,
                      selected && styles.radioLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      />
      {error && <FormError message={error} />}
    </View>
  );
}

export function FormCheckbox({
  label,
  name,
  control,
  required,
  containerStyle,
  rules,
}: {
  label: string;
  name: Path<FieldValues>;
  control?: Control<FieldValues>;
  required?: boolean;
  containerStyle?: any;
  rules?: RegisterOptions<FieldValues, Path<FieldValues>>;
}) {
  const form = useForm();
  const controlInstance = control ?? form.control;
  const error = (form.formState.errors as any)[name]?.message as
    | string
    | undefined;
  const value =
    (form.watch(name) as boolean | undefined) ??
    (form.getValues() as any)?.[name] ??
    false;

  return (
    <View style={[styles.field, containerStyle]}>
      <Controller
        control={controlInstance}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur } }) => (
          <Pressable
            style={[styles.checkboxRow, error && styles.inputError]}
            onPress={() => {
              onChange(!value);
              onBlur();
            }}
          >
            <View
              style={[styles.checkboxBox, value && styles.checkboxBoxChecked]}
            >
              {value && <Text style={styles.checkboxMark}>✓</Text>}
            </View>
            <Pressable onPress={() => {}}>
              <Text style={styles.checkboxLabel}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
              </Text>
            </Pressable>
          </Pressable>
        )}
      />
      {error && <FormError message={error} />}
    </View>
  );
}

export function FormPhoneInput({
  label,
  name,
  control,
  placeholder = "+1 (555) 000-0000",
  required,
  containerStyle,
  rules,
}: {
  label: string;
  name: Path<FieldValues>;
  control?: Control<FieldValues>;
  placeholder?: string;
  required?: boolean;
  containerStyle?: any;
  rules?: RegisterOptions<FieldValues, Path<FieldValues>>;
}) {
  const form = useForm();
  const controlInstance = control ?? form.control;
  const error = (form.formState.errors as any)[name]?.message as
    | string
    | undefined;

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 10);
    if (cleaned.length === 0) return cleaned;
    if (cleaned.length <= 3) return `(${cleaned}`;
    if (cleaned.length <= 6)
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  return (
    <View style={[styles.field, containerStyle]}>
      <FormLabel required={required}>{label}</FormLabel>
      <Controller
        control={controlInstance}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={value ? formatPhone(String(value)) : ""}
            onChangeText={(text) => onChange(formatPhone(text))}
            onBlur={onBlur}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            placeholder={placeholder}
            placeholderTextColor="#aab"
          />
        )}
      />
      {error && <FormError message={error} />}
    </View>
  );
}

export function FormDatePicker({
  label,
  name,
  control,
  placeholder = "Select date",
  required,
  containerStyle,
  rules,
  mode = "date",
}: {
  label: string;
  name: Path<FieldValues>;
  control?: Control<FieldValues>;
  placeholder?: string;
  required?: boolean;
  containerStyle?: any;
  rules?: RegisterOptions<FieldValues, Path<FieldValues>>;
  mode?: "date" | "time" | "datetime";
}) {
  const form = useForm();
  const controlInstance = control ?? form.control;
  const error = (form.formState.errors as any)[name]?.message as
    | string
    | undefined;
  const value =
    (form.watch(name) as string | undefined) ??
    (form.getValues() as any)?.[name];

  const displayValue = value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        ...(mode !== "date" && { hour: "2-digit", minute: "2-digit" }),
      })
    : "";

  return (
    <View style={[styles.field, containerStyle]}>
      <FormLabel required={required}>{label}</FormLabel>
      <Controller
        control={controlInstance}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur } }) => (
          <Pressable
            style={[styles.selectTrigger, error && styles.inputError]}
            onPress={() => {
              const input = prompt(
                `Enter ${label} (YYYY-MM-DD${mode !== "date" ? " HH:MM" : ""}):`,
                value ?? "",
              );
              if (input !== null && input.trim() !== "") {
                onChange(input.trim());
                onBlur();
              }
            }}
          >
            <Text
              style={[
                styles.selectText,
                !displayValue && styles.selectPlaceholder,
              ]}
            >
              {displayValue || placeholder}
            </Text>
            <Text style={styles.selectArrow}>📅</Text>
          </Pressable>
        )}
      />
      {error && <FormError message={error} />}
    </View>
  );
}

export function FormFileUpload({
  label,
  name,
  control,
  placeholder = "Tap to upload",
  required,
  containerStyle,
  rules,
  onFileSelected,
}: {
  label: string;
  name: Path<FieldValues>;
  control?: Control<FieldValues>;
  placeholder?: string;
  required?: boolean;
  containerStyle?: any;
  rules?: RegisterOptions<FieldValues, Path<FieldValues>>;
  onFileSelected?: (
    file: { uri?: string; name?: string; size?: number; type?: string } | null,
  ) => void;
}) {
  const form = useForm();
  const controlInstance = control ?? form.control;
  const error = (form.formState.errors as any)[name]?.message as
    | string
    | undefined;
  const value = (form.watch(name) as any) ?? (form.getValues() as any)?.[name];

  return (
    <View style={[styles.field, containerStyle]}>
      <FormLabel required={required}>{label}</FormLabel>
      <Controller
        control={controlInstance}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur } }) => (
          <Pressable
            style={[styles.fileUpload, error && styles.inputError]}
            onPress={() => {
              const input = prompt("Enter file URI or name (for demo):", "");
              if (input !== null && input.trim() !== "") {
                onChange(input.trim());
                onBlur();
                onFileSelected?.({ uri: input.trim() });
              }
            }}
          >
            <Text style={styles.fileUploadIcon}>📎</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.fileUploadText,
                  value && styles.fileUploadTextActive,
                ]}
              >
                {value || placeholder}
              </Text>
              {value && (
                <Text style={styles.fileUploadHint}>Tap to change</Text>
              )}
            </View>
            {value && (
              <Pressable
                onPress={() => {
                  onChange("");
                  onFileSelected?.(null);
                }}
              >
                <Text style={styles.fileUploadClear}>✕</Text>
              </Pressable>
            )}
          </Pressable>
        )}
      />
      {error && <FormError message={error} />}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: Spacing.one },
  label: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    fontWeight: "700",
    color: Primary.primary,
    letterSpacing: 0.05,
    marginLeft: 4,
  },
  required: { color: Brand.danger },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 32,
    backgroundColor: "#F4F7FF",
    borderWidth: 2,
    borderColor: "transparent",
    paddingHorizontal: 18,
    minHeight: 64,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#181c21",
    borderRadius: 32,
    backgroundColor: "#F4F7FF",
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputWithLeft: { paddingLeft: 12 },
  inputWithRight: { paddingRight: 12 },
  inputDisabled: { backgroundColor: "#f1f5fb", color: "#5b6478" },
  inputError: { borderColor: Brand.danger },
  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 32,
    backgroundColor: "#F4F7FF",
    borderWidth: 2,
    borderColor: "transparent",
    minHeight: 64,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#181c21",
  },
  eyeBtn: { paddingVertical: 16, paddingHorizontal: 18 },
  eyeText: { fontSize: 20 },
  codeInput: {
    paddingVertical: 20,
    paddingHorizontal: 18,
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 12,
    color: "#1c2742",
    borderRadius: 32,
    backgroundColor: "#F4F7FF",
    borderWidth: 2,
    borderColor: Primary.primaryContainer,
    borderBottomWidth: 4,
    minHeight: 64,
  },
  textArea: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 17,
    color: "#1c2742",
    borderRadius: 32,
    backgroundColor: "#F4F7FF",
    borderWidth: 2,
    borderColor: "transparent",
    minHeight: 100,
  },
  selectTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 32,
    backgroundColor: "#F4F7FF",
    borderWidth: 2,
    borderColor: "transparent",
    paddingVertical: 16,
    paddingHorizontal: 18,
    minHeight: 64,
  },
  selectText: { fontSize: 17, color: "#1c2742", flex: 1 },
  selectPlaceholder: { color: "#aab" },
  selectArrow: { fontSize: 18, color: "#7c869c", marginLeft: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.four,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: Spacing.four,
    width: "100%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1c2742",
    marginBottom: Spacing.three,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    marginBottom: Spacing.one,
  },
  modalItemSelected: { backgroundColor: "#eef4ff" },
  modalItemText: { fontSize: 16, fontWeight: "600", color: "#2b3552" },
  modalItemTextSelected: { color: Brand.primary, fontWeight: "700" },
  modalCheck: { fontSize: 20, color: Brand.primary, fontWeight: "900" },
  modalClose: {
    marginTop: Spacing.three,
    paddingVertical: Spacing.two,
    alignItems: "center",
  },
  modalCloseText: { color: Brand.danger, fontSize: 16, fontWeight: "700" },
  radioGroup: { gap: Spacing.two },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 32,
    backgroundColor: "#F4F7FF",
    borderWidth: 2,
    borderColor: "transparent",
  },
  radioItemSelected: { borderColor: Primary.primaryContainer, backgroundColor: "#F4F7FF" },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#c4ccdb",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: { borderColor: Primary.primary },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Primary.primary,
  },
  radioLabel: { fontSize: 16, fontWeight: "600", color: "#2b3552" },
  radioLabelSelected: { color: Primary.primary, fontWeight: "700" },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 32,
    backgroundColor: "#F4F7FF",
    borderWidth: 2,
    borderColor: "transparent",
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#c4ccdb",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F7FF",
  },
  checkboxBoxChecked: {
    backgroundColor: Primary.primary,
    borderColor: Primary.primary,
  },
  checkboxMark: { color: "#fff", fontSize: 14, fontWeight: "900" },
  checkboxLabel: { fontSize: 15, fontWeight: "600", color: "#2b3552", flex: 1 },
  fileUpload: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    borderRadius: 32,
    backgroundColor: "#F4F7FF",
    borderWidth: 2,
    borderColor: "transparent",
    borderStyle: "dashed",
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
  },
  fileUploadIcon: { fontSize: 28 },
  fileUploadText: { fontSize: 16, fontWeight: "600", color: "#aab" },
  fileUploadTextActive: { color: "#1c2742", fontWeight: "700" },
  fileUploadHint: { fontSize: 12, color: "#7c869c", marginTop: 2 },
  fileUploadClear: { fontSize: 18, color: Brand.danger, fontWeight: "700" },
  error: {
    color: Brand.danger,
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
});
