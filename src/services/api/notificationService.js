import mockNotifications from '@/services/mockData/notifications.json'

class NotificationService {
  constructor() {
    this.notifications = [...mockNotifications]
    this.nextId = Math.max(...this.notifications.map(n => n.Id)) + 1
  }

  getAll() {
    return Promise.resolve([...this.notifications])
  }

  getById(id) {
    const notification = this.notifications.find(n => n.Id === parseInt(id))
    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`)
    }
    return Promise.resolve({ ...notification })
  }

  create(notificationData) {
    const newNotification = {
      ...notificationData,
      Id: this.nextId++,
      createdAt: new Date().toISOString(),
      isRead: false
    }
    
    this.notifications.unshift(newNotification)
    return Promise.resolve({ ...newNotification })
  }

  update(id, data) {
    const index = this.notifications.findIndex(n => n.Id === parseInt(id))
    if (index === -1) {
      throw new Error(`Notification with ID ${id} not found`)
    }
    
    this.notifications[index] = {
      ...this.notifications[index],
      ...data,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    }
    
    return Promise.resolve({ ...this.notifications[index] })
  }

  delete(id) {
    const index = this.notifications.findIndex(n => n.Id === parseInt(id))
    if (index === -1) {
      throw new Error(`Notification with ID ${id} not found`)
    }
    
    this.notifications.splice(index, 1)
    return Promise.resolve()
  }

  markAsRead(id) {
    return this.update(id, { isRead: true })
  }

  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.isRead = true
      notification.updatedAt = new Date().toISOString()
    })
    return Promise.resolve()
  }

  getUnreadCount() {
    return Promise.resolve(this.notifications.filter(n => !n.isRead).length)
  }
}

export const notificationService = new NotificationService()