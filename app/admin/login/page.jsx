'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, Eye, EyeOff, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if auth check is complete AND user is authenticated
    if (!authLoading && isAuthenticated) {
      router.push('/admin')
    }
  }, [isAuthenticated, authLoading, router])

  const validate = () => {
    const newErrors = {}
    
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return

    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.success) {
        router.push('/admin')
      } else {
        setErrors({ submit: result.error || 'Login failed' })
      }
    } catch (error) {
      setErrors({ submit: error.message || 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sign in</h1>
          
          {/* Register Link */}
          <p className="text-sm text-gray-600 mb-8">
            Don't have an account?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Register here
            </a>
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
                  }}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email"
                />
                <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
                  }}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot Password?
              </a>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Section - Illustration */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-900 to-blue-700 items-center justify-center relative overflow-hidden">
        {/* Clouds */}
        <div className="absolute top-8 right-8 flex gap-4">
          <div className="w-16 h-10 bg-white/30 rounded-full blur-sm"></div>
          <div className="w-12 h-8 bg-white/30 rounded-full blur-sm mt-4"></div>
        </div>

        {/* Main Illustration Container */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Circle Ground */}
          <div className="relative">
            <div className="w-96 h-96 bg-gray-100 rounded-full flex items-center justify-center shadow-2xl">
              {/* Monitor */}
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  {/* Monitor Screen */}
                  <div className="w-48 h-32 bg-white rounded-lg shadow-lg border-4 border-gray-300">
                    <div className="p-4 h-full flex flex-col">
                      {/* User Icon */}
                      <div className="flex justify-center mb-2">
                        <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
                      </div>
                      {/* Login Bar */}
                      <div className="flex items-center justify-center gap-2 bg-gray-200 rounded px-3 py-2 mt-auto">
                        <span className="text-xs font-medium text-gray-700">User Login</span>
                        <Lock className="w-3 h-3 text-gray-600" />
                      </div>
                    </div>
                  </div>
                  {/* Monitor Stand */}
                  <div className="w-24 h-2 bg-gray-400 mx-auto mt-1 rounded"></div>
                  <div className="w-32 h-3 bg-gray-500 mx-auto mt-1 rounded"></div>
                </div>
              </div>

              {/* Character with Key */}
              <div className="absolute bottom-24 right-16">
                <div className="relative">
                  {/* Character */}
                  <div className="w-16 h-20">
                    {/* Head */}
                    <div className="w-12 h-12 bg-gray-800 rounded-full mx-auto"></div>
                    {/* Body */}
                    <div className="w-12 h-16 bg-blue-400 rounded-t-2xl mx-auto -mt-2"></div>
                    {/* Legs */}
                    <div className="flex gap-2 justify-center -mt-1">
                      <div className="w-4 h-8 bg-gray-700 rounded"></div>
                      <div className="w-4 h-8 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  {/* Key */}
                  <div className="absolute -left-8 top-8">
                    <div className="w-12 h-4 bg-teal-400 rounded-lg"></div>
                    <div className="w-4 h-8 bg-teal-500 rounded-lg mx-auto -mt-2"></div>
                  </div>
                </div>
              </div>

              {/* Social Login Bubble */}
              <div className="absolute bottom-16 left-20">
                <div className="bg-white rounded-full p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">G</span>
                    </div>
                    <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
