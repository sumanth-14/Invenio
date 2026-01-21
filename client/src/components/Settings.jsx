import { useState, useEffect } from 'react';

export default function Settings() {
    const [companies, setCompanies] = useState([]);
    const [roles, setRoles] = useState([]);
    const [newRole, setNewRole] = useState('');
    const [newCompany, setNewCompany] = useState({ name: '', url: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const [compRes, roleRes] = await Promise.all([
                fetch('http://localhost:5000/api/companies'),
                fetch('http://localhost:5000/api/roles')
            ]);
            const compData = await compRes.json();
            const roleData = await roleRes.json();

            setCompanies(Array.isArray(compData) ? compData : []);
            setRoles(Array.isArray(roleData) ? roleData : []);
        } catch (err) {
            console.error(err);
            setCompanies([]);
            setRoles([]);
        }
    };

    const addRole = async (e) => {
        e.preventDefault();
        if (!newRole.trim()) return;
        await fetch('http://localhost:5000/api/roles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword: newRole })
        });
        setNewRole('');
        fetchSettings();
    };

    const toggleRole = async (id, active) => {
        await fetch('http://localhost:5000/api/roles/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, active })
        });
        fetchSettings();
    };

    const deleteRole = async (id) => {
        await fetch(`http://localhost:5000/api/roles/${id}`, { method: 'DELETE' });
        fetchSettings();
    }

    const addCompany = async (e) => {
        e.preventDefault();
        if (!newCompany.name || !newCompany.url) return;
        await fetch('http://localhost:5000/api/companies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newCompany, type: 'generic' })
        });
        setNewCompany({ name: '', url: '' });
        fetchSettings();
    };

    const toggleCompany = async (id, active) => {
        await fetch('http://localhost:5000/api/companies/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, active })
        });
        fetchSettings();
    };

    const deleteCompany = async (id) => {
        await fetch(`http://localhost:5000/api/companies/${id}`, { method: 'DELETE' });
        fetchSettings();
    }

    const triggerScrape = async () => {
        alert('Scraper started! Check back in a few minutes.');
        await fetch('http://localhost:5000/api/scrape', { method: 'POST' });
    };

    return (
        <div className="space-y-12">
            <div className="flex justify-end">
                <button
                    onClick={triggerScrape}
                    className="bg-[#014D4E] hover:bg-[#013a3b] text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-[#014D4E]/20 transition-all hover:scale-105 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Run Scraper Now
                </button>
            </div>
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Target Jobs Roles</h2>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <form onSubmit={addRole} className="flex gap-4 mb-6">
                        <input
                            type="text"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            placeholder="e.g. Senior Product Manager"
                            className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#014D4E] focus:border-transparent transition-all"
                        />
                        <button type="submit" className="bg-[#014D4E] hover:bg-[#013a3b] text-white px-6 py-3 rounded-lg font-medium transition-colors">
                            Add Role
                        </button>
                    </form>

                    <div className="flex flex-wrap gap-3">
                        {roles.map(role => (
                            <div
                                key={role.id}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all ${role.active
                                    ? 'bg-[#014D4E]/10 border-[#014D4E]/30 text-[#014D4E]'
                                    : 'bg-gray-50 border-gray-200 text-gray-500'
                                    }`}
                            >
                                <div onClick={() => toggleRole(role.id, !role.active)} className="cursor-pointer font-medium">{role.keyword}</div>
                                <button
                                    onClick={() => toggleRole(role.id, !role.active)}
                                    className={`w-8 h-4 rounded-full p-0.5 transition-colors ${role.active ? 'bg-[#014D4E]' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${role.active ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                                <button onClick={() => deleteRole(role.id)} className="text-gray-400 hover:text-red-500 ml-2 font-bold">×</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Target Companies</h2>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <form onSubmit={addCompany} className="grid md:grid-cols-2 gap-4 mb-8">
                        <input
                            type="text"
                            value={newCompany.name}
                            onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                            placeholder="Company Name (e.g. Netflix)"
                            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#014D4E] focus:border-transparent transition-all"
                        />
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={newCompany.url}
                                onChange={(e) => setNewCompany({ ...newCompany, url: e.target.value })}
                                placeholder="Careers Page URL"
                                className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#014D4E] focus:border-transparent transition-all"
                            />
                            <button type="submit" className="bg-[#014D4E] hover:bg-[#013a3b] text-white px-6 py-3 rounded-lg font-medium transition-colors">
                                Add
                            </button>
                        </div>
                    </form>

                    <div className="grid gap-4">
                        {companies.map(comp => (
                            <div
                                key={comp.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-[#014D4E]/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${comp.active ? 'bg-[#014D4E]' : 'bg-gray-400'}`} />
                                    <div>
                                        <h3 className={`font-medium ${comp.active ? 'text-gray-900' : 'text-gray-500'}`}>{comp.name}</h3>
                                        <a href={comp.url} target="_blank" rel="noreferrer" className="text-sm text-gray-500 hover:text-[#014D4E] transition-colors">
                                            {comp.url}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => toggleCompany(comp.id, !comp.active)}
                                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${comp.active
                                            ? 'border-[#014D4E]/30 text-[#014D4E] bg-[#014D4E]/5'
                                            : 'border-gray-300 text-gray-500 hover:border-gray-400'
                                            }`}
                                    >
                                        {comp.active ? 'Active' : 'Paused'}
                                    </button>
                                    <button onClick={() => deleteCompany(comp.id)} className="text-gray-400 hover:text-red-500">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
