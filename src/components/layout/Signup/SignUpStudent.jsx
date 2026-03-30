import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { auth } from "@/firebase/firebase";
import { createStudent, createUser } from "@/firebase/collections";

const SignUpStudent = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Safety check handled on submit now

  // const onSubmit = async (data) => {
  //   try {
  //     const phoneNumber = `${data.countryCode}${data.phone}`;

  //     await createStudentProfile(user.uid, {
  //       name: data.fullName,
  //       phoneNumber,
  //       email: user.email,
  //     });

  //     // Redirect to student dashboard
  //     navigate("/student");
  //   } catch (error) {
  //     console.error("Student signup failed:", error);
  //     alert("Something went wrong. Please try again.");
  //   }
  // };

  const onSubmit = async (data) => {
    try {
      let currentUser = auth.currentUser;

      if (!currentUser) {
        alert("Not authenticated. Please start over.");
        navigate("/signup2");
        return;
      }

      await createUser(currentUser.uid, {
        email: currentUser.email,
        role: "STUDENT",
        isApproved: true,
        isActive: true,
        fullName: data.fullName,
        phone: `${data.countryCode}${data.phone}`,
        createdAt: new Date(),
      });

      
      // await createStudent(user.uid, { ... })
      await createStudent(currentUser.uid, {
        fullName: data.fullName,
        email: currentUser.email,
        phone: `${data.countryCode}${data.phone}`,
        photoURL: currentUser.photoURL,
      });
      navigate("/student");
    } catch (err) {
      console.error("Signup failed:", err);
      alert("Signup failed: " + err.message);
    }
  };  

  return (
    <div className="bg-[#f8f9fa] min-h-screen flex items-center px-4 justify-center">
      <div className="bg-white border rounded-xl max-w-md w-full mx-auto py-6 px-10 flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="logo-cnt flex items-center font-['Inter'] gap-1">
          <svg
            width="36"
            height="32"
            viewBox="0 0 36 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 2.66666L3 9.33332L18 16L33 9.33332L18 2.66666Z"
              fill="#4285F4"
            />
            <path
              d="M3 18.6667L18 25.3333L33 18.6667"
              stroke="#34A853"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 13.3333L18 20L33 13.3333"
              stroke="#FBBC05"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 22L18 28.6667L33 22"
              stroke="#EA4335"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xl font-bold">ClubHub</span>
        </div>
          <p className="font-light text-center">
            Create your student account to continue
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm">FULL NAME</label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="border rounded-sm p-2 bg-[#f8f9fa]"
              {...register("fullName", {
                required: "Full name is required",
                minLength: {
                  value: 3,
                  message: "Name must be at least 3 characters",
                },
              })}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Phone Number with Country Code */}
          <div className="flex flex-col gap-1">
            <label className="text-sm">PHONE</label>

            <div className="flex gap-2">
              {/* Country Code */}
              <select
                className="border rounded-sm p-2 bg-[#f8f9fa]"
                {...register("countryCode")}
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
              </select>

              {/* Phone */}
              <input
                type="tel"
                placeholder="Phone number"
                className="border rounded-sm p-2 bg-[#f8f9fa] w-full"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Enter valid 10-digit number",
                  },
                })}
              />
            </div>

            {errors.phone && (
              <p className="text-red-500 text-sm">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-blue-500 rounded-2xl text-white w-[60%] p-3 mt-4 self-center hover:bg-blue-600"
          >
            Complete Sign Up
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm space-y-2 font-light">
          <p>
            By signing in, you agree to our{" "}
            <span className="text-blue-500">Terms</span> and{" "}
            <span className="text-blue-500">Privacy Policy</span>
          </p>

          <p>
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpStudent;
