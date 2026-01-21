import { useState, useEffect } from 'react';

export default function JobDashboard() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState('All');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/jobs');
            const data = await res.json();
            if (Array.isArray(data)) {
                setJobs(data);
            } else {
                console.error('API returned non-array:', data);
                setJobs([]);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const openJob = (url) => {
        window.open(url, '_blank');
    };

    if (loading) return (
        <div className="p-10 text-center animate-pulse flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border-4 border-[#014D4E] border-t-transparent animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Loading Invenio Index...</p>
        </div>
    );

    // Extract unique companies for filter
    const companies = ['All', ...new Set(jobs.map(j => j.company))];

    const filteredJobs = selectedCompany === 'All'
        ? jobs
        : jobs.filter(j => j.company === selectedCompany);

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 px-2">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Active Opportunities</h1>
                    <p className="text-gray-500 font-medium">Showing {filteredJobs.length} roles from monitored sources</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <select
                            value={selectedCompany}
                            onChange={(e) => setSelectedCompany(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#014D4E] focus:border-transparent font-medium shadow-sm cursor-pointer hover:border-gray-400 transition-colors"
                        >
                            {companies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <button
                        onClick={fetchJobs}
                        className="px-5 py-2.5 bg-[#014D4E] hover:bg-[#013a3b] text-white rounded-lg transition-all shadow-md hover:shadow-lg font-bold flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </header>

            {filteredJobs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-400 text-lg">No jobs found in the index.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredJobs.map((job) => (
                        <div
                            key={job.id}
                            onClick={() => openJob(job.url)}
                            className="group cursor-pointer p-6 rounded-xl bg-white border border-gray-200 hover:border-invenio-teal transition-all duration-200 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden"
                        >
                            {/* Decorative Top Border */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#014D4E] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 text-xs font-bold rounded bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wider">
                                    {job.company}
                                </span>
                                {/* Creative "New" Indicator: A subtle sparkle icon for jobs found in the last 24h */}
                                {(new Date() - new Date(job.date_found) < 86400000) && (
                                    <div className="group/new relative flex items-center justify-center p-1.5 rounded-full bg-[#014D4E]/10" title="Freshly discovered">
                                        <svg className="w-4 h-4 text-[#014D4E] animate-[pulse_3s_ease-in-out_infinite]" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#014D4E] rounded-full animate-ping opacity-75"></div>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-[#014D4E] transition-colors">
                                {job.title}
                            </h3>

                            <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100">
                                <span className="text-sm font-medium text-gray-400">
                                    {new Date(job.date_found).toLocaleDateString()}
                                </span>
                                <span className="text-sm font-bold text-[#014D4E] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    View Role
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
