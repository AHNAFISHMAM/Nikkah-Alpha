import { useEffect, useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Palette } from 'lucide-react'
import toast from 'react-hot-toast'

import { supabase } from '../../lib/supabase'
import { THEME_PRESETS, ThemeKey, DEFAULT_THEME } from '../../lib/themePresets'
import { applyThemeClass } from '../../lib/applyThemeClass'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '../../components/ui'

interface ThemeSettingsValue {
  themeKey: ThemeKey
}

async function fetchThemeSettings(): Promise<ThemeSettingsValue> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'theme')
    .maybeSingle()

  if (error) throw error

  const themeKey = (data?.value?.themeKey as ThemeKey) || DEFAULT_THEME
  return { themeKey }
}

async function updateThemeSettings(themeKey: ThemeKey): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }
  const { error } = await supabase
    .from('app_settings')
    .upsert(
      {
        key: 'theme',
        value: { themeKey },
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: 'key' }
    )

  if (error) throw error
}

export function Appearance() {
  const queryClient = useQueryClient()
  const [localThemeKey, setLocalThemeKey] = useState<ThemeKey>(DEFAULT_THEME)

  const { data, isLoading } = useQuery({
    queryKey: ['app-theme'],
    queryFn: fetchThemeSettings,
  })

  const mutation = useMutation({
    mutationFn: (themeKey: ThemeKey) => updateThemeSettings(themeKey),
    onSuccess: (_, themeKey) => {
      toast.success('Theme updated for all users.')
      applyThemeClass(themeKey)
      queryClient.invalidateQueries({ queryKey: ['app-theme'] })
    },
    onError: () => {
      toast.error('Failed to update theme. Please try again.')
    },
  })

  useEffect(() => {
    if (data?.themeKey) {
      setLocalThemeKey(data.themeKey)
      applyThemeClass(data.themeKey)
    }
  }, [data])

  const handleSelectTheme = useCallback(
    (key: ThemeKey) => {
      setLocalThemeKey(key)
      mutation.mutate(key)
    },
    [mutation]
  )

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-brand flex items-center justify-center">
            <Palette className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              Appearance & Theme
            </h1>
            <p className="text-sm text-muted-foreground">
              Choose a color theme for the entire app
            </p>
          </div>
        </div>
      </header>

      <p className="text-sm text-muted-foreground">
        This updates buttons, backgrounds, and accents for all users.
      </p>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {THEME_PRESETS.map((preset) => {
            const isActive = localThemeKey === preset.key
            const isUpdating = mutation.isPending && mutation.variables === preset.key

            return (
              <Card
                key={preset.key}
                interactive
                className={`relative overflow-hidden transition-all duration-200 ${
                  isActive
                    ? 'ring-2 ring-primary shadow-md'
                    : 'hover:ring-1 hover:ring-primary/40 hover:shadow-sm'
                }`}
                onClick={() => !isUpdating && handleSelectTheme(preset.key)}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 bg-success text-white rounded-full p-1 z-10">
                    <Check className="h-4 w-4" />
                  </div>
                )}

                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{preset.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {preset.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Color swatch row */}
                  <div className="flex items-center gap-2">
                    {/* Primary color swatch */}
                    <div
                      className="h-8 w-8 rounded-md border border-border shadow-sm"
                      style={{ backgroundColor: preset.preview.primary }}
                      title="Primary color"
                    />
                    {/* Secondary color swatch */}
                    <div
                      className="h-8 w-8 rounded-md border border-border shadow-sm"
                      style={{ backgroundColor: preset.preview.secondary }}
                      title="Accent color"
                    />
                    {/* Background preview */}
                    <div
                      className="flex-1 h-8 rounded-md border border-border flex items-center justify-center text-xs text-muted-foreground shadow-sm"
                      style={{ backgroundColor: preset.preview.background }}
                      title="Background color"
                    >
                      Aa
                    </div>
                  </div>

                  {/* Select button */}
                  <Button
                    type="button"
                    variant={isActive ? 'primary' : 'outline'}
                    size="sm"
                    className="w-full"
                    disabled={isUpdating}
                    isLoading={isUpdating}
                  >
                    {isActive ? 'Active theme' : 'Use this theme'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Theme changes are applied immediately and affect all users of the app.
        </p>
      </div>
    </div>
  )
}
