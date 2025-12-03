import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Zahidul Islam. All rights
              reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <Link href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Privacy Policy</span>
              Privacy
            </Link>
            <Link href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Terms of Service</span>
              Terms
            </Link>
            <Link href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Contact</span>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
