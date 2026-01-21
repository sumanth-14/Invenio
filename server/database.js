require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- Jobs ---
async function getJobs() {
    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('date_found', { ascending: false });
    if (error) throw error;
    return data;
}

async function saveJob(job) {
    // job: { title, company, url, date_found, is_new }
    // We want to ensure NO duplicates based on URL.
    // However, if we see the same URL again, we should update 'last_seen' (if we had it) or just keep it.
    // 'ignoreDuplicates: true' means if URL exists, do nothing. This prevents duplicates perfectly.

    const { data, error } = await supabase
        .from('jobs')
        .upsert(job, { onConflict: 'url', ignoreDuplicates: true })
        .select();

    if (error) return null;
    return data;
}

// --- Companies ---
async function getCompanies() {
    const { data, error } = await supabase.from('companies').select('*').order('name');
    if (error) throw error;
    return data;
}

async function addCompany(name, url, type = 'generic') {
    const { data, error } = await supabase.from('companies').insert([{ name, url, type }]).select();
    if (error) throw error;
    return data;
}

async function toggleCompany(id, active) {
    const { data, error } = await supabase.from('companies').update({ active }).eq('id', id).select();
    if (error) throw error;
    return data;
}

async function deleteCompany(id) {
    const { error } = await supabase.from('companies').delete().eq('id', id);
    if (error) throw error;
}

// --- Roles ---
async function getRoles() {
    const { data, error } = await supabase.from('roles').select('*').order('keyword');
    if (error) throw error;
    return data;
}

async function addRole(keyword) {
    const { data, error } = await supabase.from('roles').insert([{ keyword }]).select();
    if (error) throw error;
    return data;
}

async function toggleRole(id, active) {
    const { data, error } = await supabase.from('roles').update({ active }).eq('id', id).select();
    if (error) throw error;
    return data;
}

async function deleteRole(id) {
    const { error } = await supabase.from('roles').delete().eq('id', id);
    if (error) throw error;
}

module.exports = {
    supabase,
    getJobs,
    saveJob,
    getCompanies,
    addCompany,
    toggleCompany,
    deleteCompany,
    getRoles,
    addRole,
    toggleRole,
    deleteRole
};
