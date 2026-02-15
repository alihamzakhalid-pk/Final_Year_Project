import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    Users, MessageSquare, Shield, Activity, Search,
    UserX, UserCheck, Trash2, ChevronLeft, ChevronRight,
    Crown, Ban, CheckCircle, XCircle
} from 'lucide-react'
import UICard from '../components/ui/Card'
import UIButton from '../components/ui/Button'
import SearchInput from '../components/ui/SearchInput'
import { useToast } from '../components/ui/Toast'
import api from '../api/axios'

export default function Admin() {
    const navigate = useNavigate()
    const { showSuccess, showError } = useToast()
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [users, setUsers] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [actionLoading, setActionLoading] = useState(null)

    const checkAdmin = async () => {
        setLoading(true)
        try {
            console.log('[ADMIN] Checking admin access...')
            const response = await api.get('/api/admin/check')
            console.log('[ADMIN] Response:', {
                is_admin: response.data?.is_admin,
                user: response.data?.user?.email
            })
            
            if (response.data?.is_admin) {
                console.log('[ADMIN] Admin access granted')
                setIsAdmin(true)
                showSuccess('Admin access granted!')
                fetchStats()
                fetchUsers()
            } else {
                console.log('[ADMIN] Not admin - user is_admin:', response.data?.is_admin)
                setIsAdmin(false)
                // Don't redirect immediately - show access denied page with refresh button
            }
        } catch (error) {
            console.error('[ADMIN] Access check error:', {
                status: error?.status,
                message: error?.message,
                data: error?.data
            })
            setIsAdmin(false)
            // Show access denied page instead of immediate redirect
        } finally {
            setLoading(false)
        }
    }

    // Check admin access
    useEffect(() => {
        checkAdmin()
    }, [])

    const fetchStats = async () => {
        try {
            const response = await api.get('/api/admin/stats')
            setStats(response.data)
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        }
    }

    const fetchUsers = async (page = 1, search = '') => {
        try {
            const response = await api.get('/api/admin/users', {
                params: { page, per_page: 10, search }
            })
            setUsers(response.data?.users || [])
            setTotalPages(response.data?.pages || 1)
            setCurrentPage(response.data?.current_page || 1)
        } catch (error) {
            console.error('Failed to fetch users:', error)
        }
    }

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
        fetchUsers(1, e.target.value)
    }

    const toggleAdmin = async (userId) => {
        setActionLoading(userId)
        try {
            const response = await api.post(`/api/admin/users/${userId}/toggle-admin`)
            showSuccess(response.data?.message)
            fetchUsers(currentPage, searchQuery)
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to toggle admin')
        } finally {
            setActionLoading(null)
        }
    }

    const toggleActive = async (userId) => {
        setActionLoading(userId)
        try {
            const response = await api.post(`/api/admin/users/${userId}/toggle-active`)
            showSuccess(response.data?.message)
            fetchUsers(currentPage, searchQuery)
            fetchStats()
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to toggle status')
        } finally {
            setActionLoading(null)
        }
    }

    const deleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to delete user "${username}" and all their data? This cannot be undone.`)) {
            return
        }
        setActionLoading(userId)
        try {
            const response = await api.delete(`/api/admin/users/${userId}`)
            showSuccess(response.data?.message)
            fetchUsers(currentPage, searchQuery)
            fetchStats()
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to delete user')
        } finally {
            setActionLoading(null)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Checking access...</p>
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 flex items-center justify-center p-4">
                <UICard className="max-w-md w-full p-8 text-center bg-white dark:bg-slate-800">
                    <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        You don't have admin access. If you were just made admin, use the buttons below.
                    </p>
                    <div className="space-y-3 text-sm text-left bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
                        <p className="text-blue-900 dark:text-blue-100 text-center">
                            ✅ 1. Admin made via <code className="bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded">make_admin.py</code>
                        </p>
                        <p className="text-blue-900 dark:text-blue-100 text-center">
                            👇 2. Click "Retry" below to check updated status
                        </p>
                        <p className="text-blue-900 dark:text-blue-100 text-center">
                            🎉 3. Admin Panel will appear once verified
                        </p>
                    </div>
                    <UIButton
                        onClick={() => checkAdmin()}
                        disabled={loading}
                        className="w-full mb-3 bg-primary text-white"
                    >
                        {loading ? 'Checking...' : 'Retry - Check Admin Status'}
                    </UIButton>
                    <UIButton
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="w-full mb-3"
                    >
                        Full Page Refresh
                    </UIButton>
                    <UIButton
                        onClick={() => navigate('/dashboard')}
                        variant="outline"
                        className="w-full"
                    >
                        Go to Dashboard
                    </UIButton>
                </UICard>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold text-[#1F2937] dark:text-slate-100">Admin Panel</h1>
                    </div>
                    <p className="text-[#6B7280] dark:text-slate-400">Manage users, view statistics, and control your application.</p>
                </motion.div>

                {/* Stats Cards */}
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
                    >
                        <UICard className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#1F2937] dark:text-slate-100">{stats.total_users}</p>
                                    <p className="text-xs text-[#6B7280] dark:text-slate-400">Total Users</p>
                                </div>
                            </div>
                        </UICard>
                        <UICard className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#1F2937] dark:text-slate-100">{stats.active_users}</p>
                                    <p className="text-xs text-[#6B7280] dark:text-slate-400">Active</p>
                                </div>
                            </div>
                        </UICard>
                        <UICard className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#1F2937] dark:text-slate-100">{stats.total_chats}</p>
                                    <p className="text-xs text-[#6B7280] dark:text-slate-400">Chats</p>
                                </div>
                            </div>
                        </UICard>
                        <UICard className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#1F2937] dark:text-slate-100">{stats.total_messages}</p>
                                    <p className="text-xs text-[#6B7280] dark:text-slate-400">Messages</p>
                                </div>
                            </div>
                        </UICard>
                        <UICard className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                                    <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#1F2937] dark:text-slate-100">{stats.recent_signups}</p>
                                    <p className="text-xs text-[#6B7280] dark:text-slate-400">This Week</p>
                                </div>
                            </div>
                        </UICard>
                        <UICard className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                    <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#1F2937] dark:text-slate-100">{stats.admin_count}</p>
                                    <p className="text-xs text-[#6B7280] dark:text-slate-400">Admins</p>
                                </div>
                            </div>
                        </UICard>
                    </motion.div>
                )}

                {/* User Management */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <UICard className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h2 className="text-lg font-semibold text-[#1F2937] dark:text-slate-100">User Management</h2>
                            <SearchInput
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Search users..."
                                className="w-full sm:w-64"
                            />
                        </div>

                        {/* Users Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider">User</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider">Chats</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider">Joined</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold">
                                                        {user.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium text-[#1F2937] dark:text-slate-100">{user.username}</p>
                                                            {user.is_admin && (
                                                                <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full flex items-center gap-1">
                                                                    <Crown className="h-3 w-3" /> Admin
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-[#6B7280] dark:text-slate-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {user.is_active ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                                                        <CheckCircle className="h-3 w-3" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                                                        <XCircle className="h-3 w-3" /> Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-[#1F2937] dark:text-slate-100">{user.chat_count}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-[#6B7280] dark:text-slate-400">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => toggleAdmin(user.id)}
                                                        disabled={actionLoading === user.id}
                                                        className={`p-2 rounded-lg transition-colors ${user.is_admin
                                                                ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                            }`}
                                                        title={user.is_admin ? 'Remove Admin' : 'Make Admin'}
                                                    >
                                                        <Crown className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleActive(user.id)}
                                                        disabled={actionLoading === user.id}
                                                        className={`p-2 rounded-lg transition-colors ${user.is_active
                                                                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                                : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                            }`}
                                                        title={user.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {user.is_active ? <Ban className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => deleteUser(user.id, user.username)}
                                                        disabled={actionLoading === user.id}
                                                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <p className="text-sm text-[#6B7280] dark:text-slate-400">
                                    Page {currentPage} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <UIButton
                                        onClick={() => fetchUsers(currentPage - 1, searchQuery)}
                                        disabled={currentPage <= 1}
                                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </UIButton>
                                    <UIButton
                                        onClick={() => fetchUsers(currentPage + 1, searchQuery)}
                                        disabled={currentPage >= totalPages}
                                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </UIButton>
                                </div>
                            </div>
                        )}
                    </UICard>
                </motion.div>
            </div>
        </div>
    )
}
