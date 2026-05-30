import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  AlertButton,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import BackHeader from '../components/BackHeader';
import { getAllUsers, updateUserRole } from '../services/admin';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Role, User } from '../types';

export default function UserManagement() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(['common', 'admin']);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');

  const loadUsers = useCallback(async () => {
    try {
      const data = await getAllUsers();
      setUsers(data?.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = (userId: string, currentRole: Role) => {
    const roles: Role[] = [Role.USER, Role.SELLER, Role.ADMIN];
    const buttons: AlertButton[] = roles.map(role => ({
      text: role,
      onPress: async () => {
        if (role === currentRole) return;
        try {
          await updateUserRole(userId, role);
          loadUsers();
        } catch (e) {
          Alert.alert(t('common:error'), t('admin:error_update_role'));
        }
      },
      style: role === Role.ADMIN ? 'destructive' : 'default',
    }));
    buttons.push({ text: t('common:cancel'), style: 'cancel' });
    
    Alert.alert(
      t('admin:change_user_role'),
      t('admin:current_role', { role: currentRole }),
      buttons
    );
  };

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesQuery = !q || [user.email, user.name, user.city, user.phone].filter(Boolean).some((value) => String(value).toLowerCase().includes(q));
      return matchesRole && matchesQuery;
    });
  }, [query, roleFilter, users]);

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.email[0].toUpperCase()}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{item.role}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => handleRoleChange(item.id, item.role)}
      >
        <Ionicons name="settings-outline" size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.root}>
      <BackHeader title={t('admin:user_management')} subtitle={t('admin:user_management_subtitle')} />
      <View style={styles.filters}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput style={styles.searchInput} value={query} onChangeText={setQuery} placeholder={t('common:search')} placeholderTextColor={colors.textTertiary} />
        </View>
        <View style={styles.filterRow}>
          {(['ALL', Role.USER, Role.SELLER, Role.ADMIN] as const).map((role) => (
            <TouchableOpacity key={role} style={[styles.filterChip, roleFilter === role && styles.filterChipActive]} onPress={() => setRoleFilter(role)}>
              <Text style={[styles.filterText, roleFilter === role && styles.filterTextActive]}>{role === 'ALL' ? t('common:all') : role}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
        onRefresh={() => { setRefreshing(true); loadUsers(); }}
        refreshing={refreshing}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('admin:no_users_found')}</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  filters: { paddingHorizontal: 16, paddingBottom: 6 },
  searchBox: { height: 46, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, marginBottom: 10 },
  searchInput: { flex: 1, ...typography.body2, color: colors.text, paddingVertical: 0 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight },
  filterChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  filterText: { ...typography.caption, color: colors.textSecondary },
  filterTextActive: { color: colors.primaryDark },
  listContent: { padding: 16 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: colors.primary, fontWeight: 'bold' },
  details: { flex: 1 },
  email: { ...typography.body1, fontWeight: '600', color: colors.text },
  roleBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  roleText: { fontSize: 10, color: colors.textSecondary, fontWeight: 'bold' },
  actionButton: { padding: 8 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: colors.textSecondary },
});
