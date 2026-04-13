import React from 'react'
import { MapPin, Mail } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='bg-gradient-to-r from-gray-900 to-gray-800 text-white'>
      {/* Main Footer Content */}
      <div className='max-w-6xl mx-auto px-8 py-16'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
          
          {/* About Section */}
          <div className='flex flex-col gap-4'>
            <h3 className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400'>
              Shopping
            </h3>
            <p className='text-gray-300 text-sm leading-relaxed'>
              Your one-stop destination for quality products with fast delivery and secure payments.
            </p>
          </div>

          {/* Contact Section */}
          <div className='flex flex-col gap-6'>
            <h4 className='text-lg font-bold text-emerald-400'>Contact Info</h4>
            
            {/* Address */}
            <div className='flex gap-4 items-start'>
              <MapPin className='w-6 h-6 text-cyan-400 flex-shrink-0 mt-1' />
              <div className='flex flex-col gap-1'>
                <p className='font-semibold text-white text-sm'>Address</p>
                <p className='text-gray-300 text-sm leading-relaxed'>
                  Gawade Wada, Gurudwara Colony,<br />
                  Nigdi, Pimpri-Chinchwad,<br />
                  Maharashtra 411033
                </p>
              </div>
            </div>

            {/* Email */}
            <div className='flex gap-4 items-start'>
              <Mail className='w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5' />
              <div className='flex flex-col gap-1'>
                <p className='font-semibold text-white text-sm'>Email</p>
                <a 
                  href='mailto:itspatasth12@gmail.com'
                  className='text-gray-300 text-sm hover:text-emerald-400 transition-colors'
                >
                  itspatasth12@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className='flex flex-col gap-6'>
            <h4 className='text-lg font-bold text-emerald-400'>Follow Us</h4>
            
            {/* Social Icons Grid */}
            <div className='flex flex-wrap gap-4'>
              {/* Instagram */}
              <a 
                href='https://instagram.com'
                target='_blank'
                rel='noopener noreferrer'
                className='w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-xl'
                title='Instagram'
              >
                <FontAwesomeIcon icon={faInstagram} className='text-white text-xl' />
              </a>

              {/* Email */}
              <a 
                href='mailto:itspatasth12@gmail.com'
                className='w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-xl'
                title='Email'
              >
                <Mail className='w-6 h-6 text-white' />
              </a>

              {/* GitHub */}
              <a 
                href='https://github.com/ezi0op'
                target='_blank'
                rel='noopener noreferrer'
                className='w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-xl border border-gray-500'
                title='GitHub'
              >
                <FontAwesomeIcon icon={faGithub} className='text-white text-xl' />
              </a>

              {/* LinkedIn */}
              <a 
                href='https://www.linkedin.com/in/annasaheb/'
                target='_blank'
                rel='noopener noreferrer'
                className='w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-xl'
                title='LinkedIn'
              >
                <FontAwesomeIcon icon={faLinkedin} className='text-white text-xl' />
              </a>
            </div>

            {/* Social Description */}
            <p className='text-gray-400 text-sm'>
              Connect with us on social media for updates and offers
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className='border-t border-gray-700 my-12'></div>

        {/* Bottom Footer */}
        <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
          {/* Links */}
          <div className='flex gap-6 flex-wrap justify-center md:justify-start'>
            <a href='#' className='text-gray-400 hover:text-emerald-400 transition-colors text-sm'>
              About
            </a>
            <a href='#' className='text-gray-400 hover:text-emerald-400 transition-colors text-sm'>
              Privacy Policy
            </a>
            <a href='#' className='text-gray-400 hover:text-emerald-400 transition-colors text-sm'>
              Terms of Service
            </a>
            <a href='#' className='text-gray-400 hover:text-emerald-400 transition-colors text-sm'>
              Contact Us
            </a>
          </div>

          {/* Copyright */}
          <p className='text-gray-400 text-sm text-center md:text-right'>
            © {currentYear} Shopping. All rights reserved.
          </p>
        </div>
      </div>

      {/* Animated background gradient */}
      <div className='h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500'></div>
    </footer>
  )
}

export default Footer

