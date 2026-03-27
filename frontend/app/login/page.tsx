"use client";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const handleLogin = () => {
    if (user === "admin") {
      localStorage.setItem("role", "admin");
      router.push("/admin/dashboard");
    } else {
      localStorage.setItem("role", "user");
      router.push("/map");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-6 bg-white shadow rounded w-80">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <input
          placeholder="Username"
          className="w-full mb-2 p-2 border rounded"
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded"
          onChange={(e) => setPass(e.target.value)}
        />
        <button onClick={handleLogin} className="w-full bg-black text-white py-2 rounded">
          Login
        </button>
      </div>
    </div>
  );
}