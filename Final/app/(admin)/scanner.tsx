import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Vibration,
    ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useTranslation } from 'react-i18next';

export default function ScannerScreen() {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const { colors } = useTheme();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const isScanning = React.useRef(false);
    const [lastScanResult, setLastScanResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const { data: settings, isLoading: settingsLoading } = useSystemSettings();

    useEffect(() => {
        if (!scanned) {
            isScanning.current = false;
        }
    }, [scanned]);

    const styles = getStyles(colors);

    const formatTimeWindow = (start?: number, end?: number) => {
        if (start === undefined || end === undefined) return t('common.loading');

        const formatHour = (h: number) => {
            const date = new Date();
            date.setHours(h, 0, 0, 0);
            return date.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });
        };

        return `${formatHour(start)} - ${formatHour(end)}`;
    };

    if (!permission) {
        return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
                <Text style={styles.permissionText}>{t('admin.scanner.permission')}</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>{t('common.confirm')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (isScanning.current || scanned) return;

        isScanning.current = true;
        setScanned(true);
        Vibration.vibrate(100);

        try {
            const { data: result, error } = await supabase.rpc('validate_ticket', {
                p_qr_code_data: data,
                p_admin_id: user?.id,
            });

            if (error) throw error;

            const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;

            if (parsedResult?.success) {
                setLastScanResult({
                    success: true,
                    message: `✓ Valid ${parsedResult.meal_type} ticket`,
                });
                Vibration.vibrate([0, 100, 100, 100]);
            } else {
                setLastScanResult({
                    success: false,
                    message: `✗ ${parsedResult?.error || 'Validation failed'}`,
                });
                Vibration.vibrate([0, 200, 100, 200]);
            }
        } catch (error: any) {
            setLastScanResult({
                success: false,
                message: `Error: ${error.message}`,
            });
            Vibration.vibrate([0, 200, 100, 200]);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
            >
                <View style={styles.overlay}>
                    <View style={styles.scanArea}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>

                    <Text style={styles.instruction}>
                        {t('admin.scanner.scanning')}
                    </Text>

                    {lastScanResult && (
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Ionicons
                                    name={lastScanResult.success ? "checkmark-circle" : "close-circle"}
                                    size={64}
                                    color={lastScanResult.success ? colors.success : colors.danger}
                                />
                                <Text style={styles.modalTitle}>
                                    {lastScanResult.success ? t('admin.scanner.success') : t('admin.scanner.invalid')}
                                </Text>
                                <Text style={styles.modalMessage}>{lastScanResult.message}</Text>

                                <TouchableOpacity
                                    style={[styles.modalButton, lastScanResult.success ? styles.buttonSuccess : styles.buttonError]}
                                    onPress={() => {
                                        setScanned(false);
                                        setLastScanResult(null);
                                    }}
                                >
                                    <Text style={styles.modalButtonText}>
                                        {lastScanResult.success ? t('common.confirm') : t('common.back')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {scanned && !lastScanResult && (
                        <View style={styles.scanningIndicator}>
                            <Text style={styles.scanningText}>{t('admin.scanner.processing')}</Text>
                        </View>
                    )}
                </View>
            </CameraView>

            <View style={styles.infoPanel}>
                <Text style={styles.infoPanelTitle}>{t('admin.scanner.timeWindows')}</Text>
                {settingsLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                    <>
                        <View style={styles.timeSlot}>
                            <Ionicons name="sunny" size={20} color={colors.primary} />
                            <Text style={styles.timeText}>
                                {t('meals.breakfast')}: {formatTimeWindow(settings?.mealTimes.breakfast.start, settings?.mealTimes.breakfast.end)}
                            </Text>
                        </View>
                        <View style={styles.timeSlot}>
                            <Ionicons name="restaurant" size={20} color={colors.primary} />
                            <Text style={styles.timeText}>
                                {t('meals.lunch')}: {formatTimeWindow(settings?.mealTimes.lunch.start, settings?.mealTimes.lunch.end)}
                            </Text>
                        </View>
                        <View style={styles.timeSlot}>
                            <Ionicons name="moon" size={20} color={colors.primary} />
                            <Text style={styles.timeText}>
                                {t('meals.dinner')}: {formatTimeWindow(settings?.mealTimes.dinner.start, settings?.mealTimes.dinner.end)}
                            </Text>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    camera: {
        flex: 1,
        width: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanArea: {
        width: 250,
        height: 250,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#fff',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
    },
    instruction: {
        color: '#fff',
        fontSize: 16,
        marginTop: 30,
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 8,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    modalContent: {
        backgroundColor: colors.card,
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        width: '80%',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        color: colors.text,
    },
    modalMessage: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 25,
    },
    modalButton: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    buttonSuccess: {
        backgroundColor: colors.success,
    },
    buttonError: {
        backgroundColor: colors.danger,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    scanningIndicator: {
        position: 'absolute',
        bottom: 100,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 15,
        borderRadius: 8,
    },
    scanningText: {
        color: '#fff',
        fontSize: 14,
    },
    infoPanel: {
        backgroundColor: colors.card,
        padding: 20,
        width: '100%',
    },
    infoPanelTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
        color: colors.text,
    },
    timeSlot: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    timeText: {
        fontSize: 14,
        marginLeft: 10,
        color: colors.textSecondary,
    },
    permissionText: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 15,
        marginBottom: 20,
    },
    button: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 8,
        paddingHorizontal: 30,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
