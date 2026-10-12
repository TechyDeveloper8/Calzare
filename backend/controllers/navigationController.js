import { NavigationMenu } from '../models/NavigationMenu.js';
import { logAudit } from '../utils/auditLogger.js';

export const getNavigationMenus = async (req, res, next) => {
  try {
    const menus = await NavigationMenu.find({ isActive: true });
    // Transform into a handy key-value map
    const menuMap = {};
    menus.forEach((m) => {
      menuMap[m.menuKey] = m;
    });
    res.json({ success: true, menus: menuMap });
  } catch (error) {
    next(error);
  }
};

export const adminGetAllMenus = async (req, res, next) => {
  try {
    const menus = await NavigationMenu.find();
    res.json({ success: true, menus });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateMenu = async (req, res, next) => {
  try {
    const { menuKey } = req.params;
    const { title, items, isActive, metadata } = req.body;

    let menu = await NavigationMenu.findOne({ menuKey });
    if (!menu) {
      menu = new NavigationMenu({ menuKey, title: title || menuKey });
    }

    if (title !== undefined) menu.title = title;
    if (items !== undefined) menu.items = items;
    if (isActive !== undefined) menu.isActive = isActive;
    if (metadata !== undefined) menu.metadata = { ...menu.metadata, ...metadata };

    await menu.save();
    await logAudit(req, 'UPDATE_NAVIGATION', 'NavigationMenu', menuKey, { title: menu.title });

    res.json({ success: true, menu, message: 'Navigation updated successfully' });
  } catch (error) {
    next(error);
  }
};
