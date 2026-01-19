import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const ClassroomScheduleGrid = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d131b] dark:text-slate-50 transition-colors duration-200">
      <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7ecf3] dark:border-slate-800 bg-white dark:bg-background-dark px-6 py-3 sticky top-0 z-50">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-primary">
              <div className="size-8">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" fill="currentColor"></path>
                  <path clipRule="evenodd" d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-[#0d131b] dark:text-slate-50 text-xl font-bold tracking-tight">UniBooking Grid</h2>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a onClick={() => navigate('/schedule-grid')} className="text-primary text-sm font-semibold border-b-2 border-primary pb-1 cursor-pointer">Dashboard</a>
              <a onClick={() => navigate('/search-classrooms')} className="text-[#4c6c9a] dark:text-slate-400 text-sm font-medium cursor-pointer">Classrooms</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-[#e7ecf3] dark:bg-slate-800 text-[#0d131b] dark:text-slate-50">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </button>
              <button className="p-2 rounded-lg bg-[#e7ecf3] dark:bg-slate-800 text-[#0d131b] dark:text-slate-50">
                <span className="material-symbols-outlined text-[20px]">settings</span>
              </button>
            </div>
            <div className="h-10 w-10 rounded-full bg-cover bg-center border-2 border-primary/20" style={{backgroundImage: `url("https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=136dec&color=fff")`}}></div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar: Facility Navigation */}
          <aside className="w-64 flex-shrink-0 border-r border-[#e7ecf3] dark:border-slate-800 bg-white dark:bg-background-dark p-6 flex flex-col justify-between hidden lg:flex">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-[#4c6c9a] dark:text-slate-500 uppercase tracking-widest mb-4">Facility View</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                    <span className="material-symbols-outlined text-primary">grid_view</span>
                    <span className="text-sm font-medium">Overview</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-semibold">
                    <span className="material-symbols-outlined">domain</span>
                    <span className="text-sm">Building A</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                    <span className="material-symbols-outlined text-[#4c6c9a]">domain</span>
                    <span className="text-sm">Building B</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                    <span className="material-symbols-outlined text-[#4c6c9a]">domain</span>
                    <span className="text-sm">Building C</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#4c6c9a] dark:text-slate-500 uppercase tracking-widest mb-4">Quick Filters</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input defaultChecked className="rounded text-primary focus:ring-primary w-4 h-4" type="checkbox"/>
                    <span className="text-xs font-medium">Lecture Halls</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input defaultChecked className="rounded text-primary focus:ring-primary w-4 h-4" type="checkbox"/>
                    <span className="text-xs font-medium">Science Labs</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input className="rounded text-primary focus:ring-primary w-4 h-4" type="checkbox"/>
                    <span className="text-xs font-medium">Computer Suites</span>
                  </label>
                </div>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 mb-2">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  <span className="text-xs font-bold">Conflict Alert</span>
                </div>
                <p className="text-[11px] text-orange-800 dark:text-orange-300 leading-relaxed">
                  Room A-102 has an overlapping booking at 2:00 PM.
                </p>
              </div>
            </div>
            <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-[20px]">lock</span>
              <span className="text-sm">Emergency Lockdown</span>
            </button>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] dark:bg-background-dark/50">
            {/* Page Heading & Controls */}
            <div className="p-6 bg-white dark:bg-background-dark border-b border-[#e7ecf3] dark:border-slate-800">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-3xl font-black text-[#0d131b] dark:text-white">Classroom Schedule Grid</h1>
                  <p className="text-[#4c6c9a] dark:text-slate-400 font-medium">Building A • Friday, Jan 19, 2026</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-background-light dark:bg-slate-800 p-1 rounded-lg border border-[#e7ecf3] dark:border-slate-700">
                    <button className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                    <span className="px-4 text-sm font-bold">Oct 24</span>
                    <button className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm shadow-primary/20">
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Maintenance Block
                  </button>
                </div>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-6 mt-6 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span className="text-[11px] font-bold text-[#4c6c9a] uppercase">Academic</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-500"></div>
                  <span className="text-[11px] font-bold text-[#4c6c9a] uppercase">Event</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border border-slate-300" style={{background: 'repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 10px, #e2e8f0 10px, #e2e8f0 20px)'}}></div>
                  <span className="text-[11px] font-bold text-[#4c6c9a] uppercase">Maintenance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500 animate-pulse"></div>
                  <span className="text-[11px] font-bold text-[#4c6c9a] uppercase">Conflict</span>
                </div>
              </div>
            </div>

            {/* Grid Container */}
            <div className="flex-1 overflow-auto relative" style={{scrollbarWidth: 'thin'}}>
              {/* Timeline Header */}
              <div className="sticky top-0 z-30 bg-white/95 dark:bg-background-dark/95 backdrop-blur flex border-b border-[#e7ecf3] dark:border-slate-800">
                <div className="w-48 flex-shrink-0 p-4 border-r border-[#e7ecf3] dark:border-slate-800 bg-white dark:bg-background-dark flex items-center justify-center">
                  <span className="text-xs font-bold text-[#4c6c9a] dark:text-slate-500">ROOMS</span>
                </div>
                <div className="flex">
                  {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map((time, idx) => (
                    <div key={idx} className={`w-40 h-12 border-r border-slate-100 dark:border-slate-800 flex items-center justify-center text-[11px] font-bold ${idx === 3 ? 'text-primary bg-primary/5' : 'text-[#4c6c9a]'}`}>
                      {time}
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid Rows */}
              <div className="flex flex-col relative min-h-full" style={{backgroundImage: 'radial-gradient(#e7ecf3 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
                {/* Current Time Indicator */}
                <div className="absolute top-0 bottom-0 left-[628px] w-0.5 bg-primary z-20 pointer-events-none">
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-primary rounded-full ring-4 ring-primary/20"></div>
                </div>

                {/* Row 1 - Room A-101 */}
                <div className="flex border-b border-slate-100 dark:border-slate-800 group h-24">
                  <div className="w-48 flex-shrink-0 p-4 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-background-dark sticky left-0 z-10">
                    <p className="text-sm font-bold text-[#0d131b] dark:text-white">Room A-101</p>
                    <p className="text-[10px] text-[#4c6c9a]">Lec Hall • Cap: 120</p>
                    <div className="flex gap-1 mt-1 text-slate-400">
                      <span className="material-symbols-outlined text-[14px]">videocam</span>
                      <span className="material-symbols-outlined text-[14px]">mic</span>
                      <span className="material-symbols-outlined text-[14px]">wifi</span>
                    </div>
                  </div>
                  <div className="flex relative">
                    <div className="absolute top-4 left-0 w-80 h-16 bg-blue-500 text-white rounded-lg p-3 shadow-md border-l-4 border-blue-700 z-10 cursor-pointer overflow-hidden">
                      <p className="text-xs font-bold truncate">Intro to Macroeconomics</p>
                      <p className="text-[10px] opacity-80">Admin</p>
                    </div>
                    <div className="absolute top-4 left-[640px] w-40 h-16 rounded-lg flex items-center justify-center z-10 group/slot border border-slate-300 dark:border-slate-600" style={{background: 'repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 10px, #e2e8f0 10px, #e2e8f0 20px)'}}>
                      <span className="material-symbols-outlined text-slate-400">build</span>
                    </div>
                  </div>
                </div>

                {/* Row 2 - Room A-102 with Conflict */}
                <div className="flex border-b border-slate-100 dark:border-slate-800 group h-24">
                  <div className="w-48 flex-shrink-0 p-4 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-background-dark sticky left-0 z-10">
                    <p className="text-sm font-bold text-[#0d131b] dark:text-white">Room A-102</p>
                    <p className="text-[10px] text-[#4c6c9a]">Seminar • Cap: 30</p>
                  </div>
                  <div className="flex relative">
                    <div className="absolute top-4 left-[160px] w-[280px] h-16 bg-red-500 text-white rounded-lg p-3 shadow-md border-2 border-red-700 z-10 cursor-pointer flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold truncate">Conflict: 2 Bookings</p>
                        <p className="text-[10px] opacity-90">Advanced Calculus / Study Group</p>
                      </div>
                      <span className="material-symbols-outlined text-[20px] animate-pulse">error</span>
                    </div>
                    <div className="absolute top-4 left-[480px] w-80 h-16 bg-purple-500 text-white rounded-lg p-3 shadow-md border-l-4 border-purple-700 z-10 cursor-pointer">
                      <p className="text-xs font-bold truncate">Alumni Networking Mixer</p>
                      <p className="text-[10px] opacity-80">University Advancement</p>
                    </div>
                  </div>
                </div>

                {/* Row 3 - Room A-103 */}
                <div className="flex border-b border-slate-100 dark:border-slate-800 group h-24">
                  <div className="w-48 flex-shrink-0 p-4 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-background-dark sticky left-0 z-10">
                    <p className="text-sm font-bold text-[#0d131b] dark:text-white">Room A-103</p>
                    <p className="text-[10px] text-[#4c6c9a]">Chem Lab • Cap: 45</p>
                  </div>
                  <div className="flex relative">
                    <div className="absolute top-4 left-[320px] w-80 h-16 bg-blue-500 text-white rounded-lg p-3 shadow-md border-l-4 border-blue-700 z-10 cursor-pointer">
                      <p className="text-xs font-bold truncate">Organic Chemistry II Lab</p>
                      <p className="text-[10px] opacity-80">Dr. Marcus Thorne</p>
                    </div>
                  </div>
                </div>

                {/* Row 4 - Room A-104 Closed */}
                <div className="flex border-b border-slate-100 dark:border-slate-800 group h-24">
                  <div className="w-48 flex-shrink-0 p-4 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-background-dark sticky left-0 z-10">
                    <p className="text-sm font-bold text-[#0d131b] dark:text-white">Room A-104</p>
                    <p className="text-[10px] text-[#4c6c9a]">Lec Hall • Cap: 200</p>
                  </div>
                  <div className="flex relative">
                    <div className="absolute top-4 left-0 w-full h-16 opacity-30 pointer-events-none" style={{background: 'repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 10px, #e2e8f0 10px, #e2e8f0 20px)'}}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">lock</span>
                        <span className="text-xs font-bold text-slate-500">CLOSED FOR MAINTENANCE</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Empty Rows */}
                {['Room A-105', 'Room A-106'].map((room, idx) => (
                  <div key={idx} className="flex border-b border-slate-100 dark:border-slate-800 group h-24 hover:bg-primary/5 transition-colors cursor-crosshair">
                    <div className="w-48 flex-shrink-0 p-4 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-background-dark sticky left-0 z-10">
                      <p className="text-sm font-bold text-[#0d131b] dark:text-white">{room}</p>
                      <p className="text-[10px] text-[#4c6c9a]">{idx === 0 ? 'Lecture Hall' : 'Seminar Room'}</p>
                    </div>
                    <div className="flex-1 relative"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Stats */}
            <div className="px-6 py-4 bg-white dark:bg-background-dark border-t border-[#e7ecf3] dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-[#4c6c9a] uppercase tracking-wider">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-green-500"></span>
                  <span>24 Available Slots</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-blue-500"></span>
                  <span>12 Ongoing Classes</span>
                </div>
                <div className="flex items-center gap-2 text-red-500">
                  <span className="size-2 rounded-full bg-red-500"></span>
                  <span>1 Critical Conflict</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span>Zoom Level: 100%</span>
                <div className="flex gap-2">
                  <button className="size-6 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50"><span className="material-symbols-outlined text-[14px]">remove</span></button>
                  <button className="size-6 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50"><span className="material-symbols-outlined text-[14px]">add</span></button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ClassroomScheduleGrid;
