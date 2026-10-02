import Swal from 'sweetalert2'
import type { SweetAlertOptions } from 'sweetalert2'

const SWAL_ABOVE_MUI_Z_INDEX = 1600

/** Confirmation modals (use inside MUI Dialog so z-index stays above the sheet). */
export const confirmDialog = (options: SweetAlertOptions) =>
	Swal.fire({
		...options,
		didOpen: popup => {
			const container = popup.closest('.swal2-container') as HTMLElement | null
			if (container) container.style.zIndex = String(SWAL_ABOVE_MUI_Z_INDEX)
			if (typeof options.didOpen === 'function') options.didOpen(popup)
		},
	})

export const createToast = async (message: any, type = 'error', position = 'top-right') => {
   
    const Toast = Swal.mixin({
        toast: true,
         position: position,
        iconColor: type,
        customClass: {
            popup: 'colored-toast'
        },
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast: { addEventListener: (arg0: string, arg1: any) => void }) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })

    await Toast.fire({
        icon: type,
        title: message,
        // position:position
    })
}

export const createToast2 = async (message: any, type = 'success', position = 'top-right') => {
    const Toast = Swal.mixin({
        toast: true,
         position: position,
        iconColor: type,
        customClass: {
            popup: 'colored-toast'
        },
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast: { addEventListener: (arg0: string, arg1: any) => void }) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })

    await Toast.fire({
        icon: type,
        title: message,
        // position:position
    })
}