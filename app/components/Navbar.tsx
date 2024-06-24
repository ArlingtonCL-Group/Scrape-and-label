'use client';
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from 'next/link';
import LoginButton from '../login/login-btn';

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  useEffect(() => {
    const connect = async () => {
      if (!loading && !session) {
        router.push("/login");
      }
    };
    connect();
  }, [loading]);

  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
      {loading || (!session) && (
        <div className="flex justify-between items-center text-xl font-bold py-4 px-8">
          <div className="ml-1 text-2xl">AniVoice</div>
          {pathname === '/login' && <div>Login Page</div>}
        </div>
      )}

      {!loading && !(pathname === '/login') && session && (
        <div className="flex justify-between items-center py-4 px-8">
          <Link href="/">
            <span className="text-2xl font-bold cursor-pointer hover:text-blue-200 transition duration-300">AniVoice</span>
          </Link>
          
          <div className="flex space-x-8">
            <div className="dropdown dropdown-hover">
              <div tabIndex={0} role="button" className="btn m-1 bg-blue-700 hover:bg-blue-600 text-white border-none rounded-full px-4 py-2 transition duration-300">Leaderboard</div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-white rounded-lg w-52">
                <li><Link href="/leaderboard"><span className="block px-4 py-2 text-blue-800 hover:bg-blue-100">Leaderboard</span></Link></li>

                {/* Add more options here
                <li><Link href="/home-option2"><span className="block px-4 py-2 text-blue-800 hover:bg-blue-100">Home Option 2</span></Link></li>
                <li><Link href="/home-option3"><span className="block px-4 py-2 text-blue-800 hover:bg-blue-100">Home Option 3</span></Link></li>
                */}

              </ul>
            </div>
            <div className="dropdown dropdown-hover">
              <div tabIndex={0} role="button" className="btn m-1 bg-blue-700 hover:bg-blue-600 text-white border-none rounded-full px-4 py-2 transition duration-300">Upload</div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-white rounded-lg w-52">
                <li><Link href="/upload-option1"><span className="block px-4 py-2 text-blue-800 hover:bg-blue-100">Upload video</span></Link></li>

                {/* Add more upload options here}
                <li><Link href="/upload-option2"><span className="block px-4 py-2 text-blue-800 hover:bg-blue-100">Upload Option 2</span></Link></li>
                <li><Link href="/upload-option3"><span className="block px-4 py-2 text-blue-800 hover:bg-blue-100">Upload Option 3</span></Link></li>
                */}

              </ul>
            </div>
            {session.user?.role === 'usurper' || session.user?.role === 'admin' ? (
              <div className="dropdown dropdown-hover">
                <div tabIndex={0} role="button" className="btn m-1 bg-blue-700 hover:bg-blue-600 text-white border-none rounded-full px-4 py-2 transition duration-300">Admin</div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-white rounded-lg w-52">
                  <li><Link href="/admin/register"><span className="block px-4 py-2 text-blue-800 hover:bg-blue-100">Add Accounts</span></Link></li>
                  <li><Link href="/admin/scrape"><span className="block px-4 py-2 text-blue-800 hover:bg-blue-100">Scrape</span></Link></li>
                </ul>
              </div>
            ) : null}
          </div>
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <span className="text-sm font-light mr-2">Welcome, {session.user?.name || ""}</span>
              <span className="text-xs text-blue-300">({session.user?.role})</span>
            </div>
          <LoginButton session={session} loading={loading} />
        </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
