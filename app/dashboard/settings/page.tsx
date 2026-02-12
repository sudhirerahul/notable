'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const [slackWebhook, setSlackWebhook] = useState('')
  const [timeZone, setTimeZone] = useState('America/New_York')
  const [workingHoursStart, setWorkingHoursStart] = useState(9)
  const [workingHoursEnd, setWorkingHoursEnd] = useState(17)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()

      if (data.settings) {
        setTimeZone(data.settings.timeZone || 'America/New_York')
        setWorkingHoursStart(data.settings.workingHoursStart || 9)
        setWorkingHoursEnd(data.settings.workingHoursEnd || 17)
        setSlackWebhook(data.settings.slackWebhookUrl || '')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeZone,
          workingHoursStart,
          workingHoursEnd,
          slackWebhookUrl: slackWebhook || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">
          Configure your preferences and integrations
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Google Calendar */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Google Calendar
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300">Calendar Integration</p>
              <p className="text-sm text-gray-500 mt-1">
                Connected via Google OAuth
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-emerald-400 text-sm">Connected</span>
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Working Hours
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Time
              </label>
              <select
                value={workingHoursStart}
                onChange={(e) => setWorkingHoursStart(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Time
              </label>
              <select
                value={workingHoursEnd}
                onChange={(e) => setWorkingHoursEnd(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Slack Integration */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Slack Notifications
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="slack-webhook"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Webhook URL
              </label>
              <input
                type="url"
                id="slack-webhook"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-sm text-gray-500 mt-2">
                Get notified in Slack when tasks are scheduled
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 text-white rounded-lg transition-colors"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            'Save Settings'
          )}
        </button>
      </form>
    </div>
  )
}
