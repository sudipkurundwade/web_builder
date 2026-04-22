import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Mail, Calendar, Shield } from 'lucide-react';

const Profile: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p>Please sign in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Profile</h1>
                <Badge variant="secondary" className="flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    Verified
                </Badge>
            </div>

            {/* Profile Overview Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Overview</CardTitle>
                    <CardDescription>
                        Manage your personal information and account settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user?.photoURL || ''} alt={user?.name || 'User'} />
                            <AvatarFallback className="text-lg">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">{user?.name || 'User'}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {user?.email || 'No email'}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                Joined Recently
                            </p>
                        </div>
                    </div>
                    <Separator />
                    
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input 
                                id="displayName"
                                value={user?.name || ''}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input 
                                id="email"
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                    </div>

                    {/* Account Status */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium">Account Status</h4>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm">Account Active</span>
                            </div>
                            <Badge variant="outline">Premium</Badge>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button variant="outline" className="flex-1">
                            Edit Profile
                        </Button>
                        <Button variant="outline" className="flex-1">
                            Change Password
                        </Button>
                        <Button variant="destructive" className="flex-1">
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Additional Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>
                        Customize your app experience
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium">Email Notifications</h4>
                            <p className="text-xs text-muted-foreground">
                                Receive updates about your account activity
                            </p>
                        </div>
                        <Button variant="outline" size="sm">
                            Configure
                        </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium">Privacy Settings</h4>
                            <p className="text-xs text-muted-foreground">
                                Control who can see your information
                            </p>
                        </div>
                        <Button variant="outline" size="sm">
                            Manage
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Profile;
