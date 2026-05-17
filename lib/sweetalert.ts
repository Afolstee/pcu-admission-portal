import Swal from 'sweetalert2';

export const modernAlert = Swal.mixin({
  customClass: {
    popup: 'rounded-[2rem] shadow-2xl border border-indigo-50 dark:border-slate-800 bg-white dark:bg-slate-900 !pt-8 !pb-6',
    title: 'text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight !mt-4',
    htmlContainer: 'text-slate-500 dark:text-slate-400 font-medium text-base !mt-3',
    confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all scale-100 hover:scale-[1.03] active:scale-[0.97] mx-2',
    cancelButton: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3.5 px-8 rounded-2xl transition-all scale-100 hover:scale-[1.03] active:scale-[0.97] mx-2',
    icon: '!border-0 !scale-150 !mt-2',
  },
  buttonsStyling: false,
  showClass: {
    popup: 'animate-in zoom-in-75 slide-in-from-bottom-12 fade-in duration-[400ms] ease-out-back fill-mode-forwards',
    backdrop: 'animate-in fade-in duration-300 !bg-slate-900/30 !backdrop-blur-md',
  },
  hideClass: {
    popup: 'animate-out zoom-out-90 slide-out-to-bottom-8 fade-out duration-[250ms] ease-in-back fill-mode-forwards',
    backdrop: 'animate-out fade-out duration-200 !bg-transparent !backdrop-blur-none',
  },
});
