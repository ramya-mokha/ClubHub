import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "@/firebase/firebase";
import { createClubRequest, createUser } from "@/firebase/collections";
const SignUpClub = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Safety check handled on submit now

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
        role: "CLUB",
        isApproved: false,
        isActive: true,
      });
      await createClubRequest(currentUser.uid, {
        clubName: data.clubName,
        presidentName: data.presidentName,
        email: currentUser.email,
        // phone: data.phone,
        //description: data.description,
      });

      // Redirect to waiting approval page
      navigate("/waiting-approval");
    } catch (error) {
      console.error("Club request failed:", error);
      alert("Failed to submit approval request. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4">
      <div className="bg-white border rounded-xl w-full max-w-md p-8 text-center space-y-5">

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
            Create your club account to continue
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 text-left"
        >
          {/* Club Name */}
          <div>
            <label className="text-xs">CLUB NAME</label>
            <input
              type="text"
              placeholder="Enter club name"
              className="border rounded-md p-2 w-full bg-[#f8f9fa]"
              {...register("clubName", {
                required: "Club name is required",
              })}
            />
            {errors.clubName && (
              <p className="text-red-500 text-sm">
                {errors.clubName.message}
              </p>
            )}
          </div>

          {/* Club Head Name */}
          <div>
            <label className="text-xs">CLUB HEAD NAME</label>
            <input
              type="text"
              placeholder="Enter club head name"
              className="border rounded-md p-2 w-full bg-[#f8f9fa]"
              {...register("presidentName", {
                required: "Club head name is required",
              })}
            />
            {errors.clubHeadName && (
              <p className="text-red-500 text-sm">
                {errors.clubHeadName.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-green-500 text-white rounded-md p-2 mt-2 hover:bg-green-600"
          >
            Submit Club Request
          </button>
        </form>

        {/* Footer */}
        <div className="text-xs text-gray-500 space-y-2">
          <p>
            By signing in, you agree to our{" "}
            <span className="text-blue-500">Terms</span> and{" "}
            <span className="text-blue-500">Privacy Policy</span>
          </p>
          <p>
            Already have account?{" "}
            <Link to="/login" className="text-blue-500">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpClub;
