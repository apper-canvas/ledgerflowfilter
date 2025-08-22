import auditService from "@/services/api/auditService";
import React from "react";
import mockNotifications from "@/services/mockData/notifications.json";
import Error from "@/components/ui/Error";

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

async create(notificationData) {
    const newNotification = {
      ...notificationData,
      Id: this.nextId++,
      createdAt: new Date().toISOString(),
      isRead: false
    }
    
    this.notifications.unshift(newNotification)
    
    // Log the creation
    await auditService.logOperation(
      'notification',
      newNotification.Id,
      'create',
      { title: newNotification.title, type: newNotification.type },
      null,
      newNotification
    )
    
    return Promise.resolve({ ...newNotification })
  }

async update(id, data) {
async update(id, data) {
    const index = this.notifications.findIndex(n => n.Id === parseInt(id))
    if (index === -1) {
      throw new Error(`Notification with ID ${id} not found`)
    }
    
    const oldNotification = { ...this.notifications[index] }
    this.notifications[index] = {
      ...this.notifications[index],
      ...data,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    }
    
    // Log the update
    await auditService.logOperation(
      'notification',
      parseInt(id),
      'update',
      data,
      oldNotification,
      this.notifications[index]
    )
    
    return Promise.resolve({ ...this.notifications[index] })
  }

async delete(id) {
async delete(id) {
    const index = this.notifications.findIndex(n => n.Id === parseInt(id))
    if (index === -1) {
      throw new Error(`Notification with ID ${id} not found`)
    }
    
    const deletedNotification = { ...this.notifications[index] }
    this.notifications.splice(index, 1)
    
    // Log the deletion
    await auditService.logOperation(
      'notification',
      parseInt(id),
      'delete',
      null,
      deletedNotification,
      null
    )
    
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