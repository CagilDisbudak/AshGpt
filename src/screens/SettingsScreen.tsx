import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { loadSettings, saveSettings, DEFAULT_SETTINGS, Settings, type ThemeMode } from '../storage/settings';
import { testConnection } from '../api/jan';
import { useTheme } from '../theme/ThemeContext';

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: 'Açık' },
    { value: 'dark', label: 'Koyu' },
    { value: 'chatgpt', label: 'ChatGPT' },
];

const SettingsScreen = () => {
    const { colors, theme, refreshTheme } = useTheme();
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            const loaded = await loadSettings();
            setSettings(loaded);
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        await saveSettings(settings);
        await refreshTheme();
        Alert.alert('Başarılı', 'Ayarlar kaydedildi');
    };

    const handleReset = () => {
        setSettings(DEFAULT_SETTINGS);
    };

    const handleTestConnection = async () => {
        setTesting(true);
        const result = await testConnection(settings.baseUrl, settings.apiKey);
        setTesting(false);

        if (result.success) {
            Alert.alert('Bağlantı Başarılı', result.message);
        } else {
            Alert.alert('Bağlantı Başarısız', result.message);
        }
    };

    const updateSetting = (key: keyof Settings, value: string | number) => {
        setSettings({ ...settings, [key]: value });
    };

    const handleThemeChange = async (mode: ThemeMode) => {
        updateSetting('theme', mode);
        const next = { ...settings, theme: mode };
        await saveSettings(next);
        setSettings(next);
        await refreshTheme();
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>Tema</Text>
                <View style={styles.themeRow}>
                    {THEME_OPTIONS.map((opt) => (
                        <TouchableOpacity
                            key={opt.value}
                            style={[
                                styles.themeOption,
                                {
                                    backgroundColor: theme === opt.value ? colors.primary : colors.surface,
                                    borderColor: colors.border,
                                },
                            ]}
                            onPress={() => handleThemeChange(opt.value)}
                        >
                            <Text
                                style={[
                                    styles.themeOptionText,
                                    { color: theme === opt.value ? '#FFFFFF' : colors.text },
                                ]}
                            >
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>Base URL</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    value={settings.baseUrl}
                    onChangeText={(text) => updateSetting('baseUrl', text)}
                    placeholder="http://192.168.1.56:1337/v1"
                    placeholderTextColor={colors.placeholder}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                    PC IP + port + /v1 (örn. http://192.168.1.56:1337/v1). "Invalid host header" alıyorsanız: Jan → Settings → Local API → Server Host: 0.0.0.0 yapın. Aynı Wi‑Fi + 1337 firewall izni.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>API Key (İsteğe bağlı)</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    value={settings.apiKey}
                    onChangeText={(text) => updateSetting('apiKey', text)}
                    placeholder="API Key girin"
                    placeholderTextColor={colors.placeholder}
                    secureTextEntry={true}
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>Model</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    value={settings.model}
                    onChangeText={(text) => updateSetting('model', text)}
                    placeholder="Model adı"
                    placeholderTextColor={colors.placeholder}
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.row}>
                <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
                    <Text style={[styles.label, { color: colors.text }]}>Temperature</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                        value={settings.temperature.toString()}
                        onChangeText={(text) => updateSetting('temperature', parseFloat(text) || 0)}
                        keyboardType="decimal-pad"
                    />
                </View>
                <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
                    <Text style={[styles.label, { color: colors.text }]}>Max Tokens</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                        value={settings.maxTokens.toString()}
                        onChangeText={(text) => updateSetting('maxTokens', parseInt(text) || 0)}
                        keyboardType="number-pad"
                    />
                </View>
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.success }]}
                onPress={handleTestConnection}
                disabled={testing}
            >
                {testing ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.buttonText}>Bağlantıyı Test Et</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSave}>
                <Text style={styles.buttonText}>Ayarları Kaydet</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.resetButton, { borderColor: colors.danger }]}
                onPress={handleReset}
            >
                <Text style={[styles.buttonText, { color: colors.danger }]}>Varsayılana Sıfırla</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
        fontSize: 16,
        borderWidth: 1,
    },
    helpText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    row: {
        flexDirection: 'row',
    },
    themeRow: {
        flexDirection: 'row',
        gap: 10,
    },
    themeOption: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
    },
    themeOptionText: {
        fontSize: 15,
        fontWeight: '600',
    },
    button: {
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 12,
    },
    resetButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SettingsScreen;
