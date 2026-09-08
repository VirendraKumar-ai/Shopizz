export const useAdmin = () => {
  const applications = ref<any[]>([])
  const owners = ref<any[]>([])

  const applicationsLoading = ref(false)
  const ownersLoading = ref(false)

  const error = ref('')

  const fetchApplications = async () => {
    applicationsLoading.value = true
    error.value = ''

    try {
      const response = await $fetch<{
        success: boolean
        applications: any[]
      }>('/api/admin/owner-applications')

      applications.value = response.applications ?? []
    } catch (err: any) {
      error.value =
        err?.data?.message ||
        err?.message ||
        'Unable to load owner applications.'

      throw err
    } finally {
      applicationsLoading.value = false
    }
  }

  const approveApplication = async (id: string) => {
    await $fetch(
      `/api/admin/owner-applications/${id}/approve`,
      {
        method: 'POST',
      },
    )

    await fetchApplications()
  }

  const rejectApplication = async (
    id: string,
    reason: string,
  ) => {
    await $fetch(
      `/api/admin/owner-applications/${id}/reject`,
      {
        method: 'POST',
        body: {
          reason,
        },
      },
    )

    await fetchApplications()
  }

  const fetchOwners = async () => {
    ownersLoading.value = true
    error.value = ''

    try {
      const response = await $fetch<{
        success: boolean
        owners: any[]
      }>('/api/admin/owners')

      owners.value = response.owners ?? []
    } catch (err: any) {
      error.value =
        err?.data?.message ||
        err?.message ||
        'Unable to load owners.'

      throw err
    } finally {
      ownersLoading.value = false
    }
  }

  const fetchOwner = async (id: string) => {
    return await $fetch<{
      success: boolean
      owner: any
      shop: any
    }>(`/api/admin/owners/${id}`)
  }

  return {
    applications,
    owners,

    applicationsLoading,
    ownersLoading,

    error,

    fetchApplications,
    approveApplication,
    rejectApplication,
    fetchOwners,
    fetchOwner,
  }
}