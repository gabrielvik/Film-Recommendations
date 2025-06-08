import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { User, Mail, Settings, Heart, Clock } from 'lucide-react'

const ProfilePage = () => {
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="p-6 space-y-4">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Profile Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input value={user?.name || ''} disabled={!isEditing} />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={user?.email || ''} disabled={!isEditing} />
              </div>
              {isEditing && (
                <div className="flex space-x-4">
                  <Button size="sm">Save Changes</Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Favorite Movies</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Watchlist</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
