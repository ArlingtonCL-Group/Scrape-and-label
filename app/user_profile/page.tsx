"use client";
import { ChangeEvent, useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useSession, signOut, getSession } from "next-auth/react";
import defaultAvatar from "/public/defaultAvatar.png"
export default function Page() {
    const { data: session, status } = useSession();
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    //https:img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
    const [profileInfo, setProfileInfo] = useState({
        username: "",
        confirmPassword: "",
        password: "",
        role: ""
    });
    const [postImage, setPostImage] = useState( { myFile: ""})
    
    const router = useRouter();
    const loading = status === 'loading';

    useEffect(() => {
        if (!loading && !session) {
            router.push("/login");
        } else if (session) {
            fetchUserProfile();
        }
    }, [session, loading]);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch(`/api/update_profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setProfileInfo({
                    username: data.user.username ?? "",
                    confirmPassword: "",
                    password: "",
                    role: data.user.role ?? "",
                });
                setPostImage({...postImage, myFile: data.user.avatar})
            } else {
                throw new Error('Failed to fetch user profile');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleChange = (event : ChangeEvent < HTMLInputElement >) => {
        const { name, value } = event.target;
        setProfileInfo((prevData) => ({
            ...prevData,
            [name]: value
        }));
        
    };

    const handleSave = async(event : ChangeEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isChangingPassword && profileInfo.password !== profileInfo.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        setIsEditing(false);
        setIsChangingPassword(false);
        console.log(profileInfo.username)
        try {
            const response = await fetch(`/api/update_profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username : profileInfo.username,
                    password : profileInfo.password,
                    avatar : postImage.myFile,
                    
                }),
            });
            const contentType = response.headers.get('content-type');
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
                console.log(data)
            } else {
                const text = await response.text();
                throw new Error(text || 'Something went wrong');
            }
            
            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            alert("Profile updated successfully!");
            setIsEditing(false);
            
        } catch (error : unknown) {
            const err = error as Error;
            console.error('An error occurred', err);
            alert(err.message);
        }
    
    };

    const convertToB64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => resolve(fileReader.result as string);
            fileReader.onerror = (error) => reject(error);
        });
    };

    const handleFileUpload = async(e:any) => {
        const file = e.target.files[0];
        const base64: any = await convertToB64(file)
        
        setPostImage({...postImage, myFile: base64})
        console.log(postImage)

    }

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <h1 className="text-2xl font-bold text-center">Profile Page</h1>
                {isEditing ? (
                    <form className="space-y-6" onSubmit={handleSave}>
                        <div className="avatar">
                            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <img src={postImage.myFile as string  } alt="" />
                                
                            </div>
                        </div>
 
                        <input type="file" className="file-input file-input-ghost w-full max-w-xs" 
                        accept='.jpeg, .png, .jpg' id='file-upload' name='myFile'
                        onChange={(e) => handleFileUpload(e) } />

                        {!isChangingPassword && (
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium leading-6 text-gray-900">
                                    Username
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        value={profileInfo.username}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                        )}
                        {isChangingPassword && (
                            <>
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium leading-6 text-gray-900">
                                        New Password
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={profileInfo.password}
                                            onChange={handleChange}
                                            className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium leading-6 text-gray-900">
                                        Confirm Password
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            value={profileInfo.confirmPassword}
                                            onChange={handleChange}
                                            className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        <div>
                            <button type="submit" className="btn btn-wide">Save</button>
                        </div>
                        {!isChangingPassword && (
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setIsChangingPassword(true)}
                                    className="btn btn-wide">
                                    Change Password
                                </button>
                            </div>
                        )}
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="avatar">
                            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <img src={postImage.myFile as string  } />
  
                            </div>
                        </div>
                        <div>
                            <p className="block text-sm font-medium leading-6 text-gray-900">Username</p>
                            <p className="mt-2">{profileInfo.username}</p>
                        </div>
                        <div>
                            <p className="block text-sm font-medium leading-6 text-gray-900">Role</p>
                            <p className="mt-2">{profileInfo.role}</p>
                        </div>
                        <div>
                            <button onClick={() => setIsEditing(true)} className="btn btn-wide">Edit</button>
                        </div>
                    </div>
                )}
                <div className="mt-4">
                    <div>
                        <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn btn-wide">Sign Out</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
