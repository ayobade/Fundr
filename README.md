# 🚀 Fundr - Decentralized Crowdfunding Platform

A modern, responsive crowdfunding platform built with vanilla HTML, CSS, and JavaScript. Fundr enables users to create campaigns, browse projects, and support initiatives with cryptocurrency or Other type of  payments.

## ✨ Features

### 🎯 Campaign Creation
- **Multi-step form** with 6 intuitive steps
- **Image upload system** with cover image and gallery (up to 5 images)
- **Real-time validation** with visual error states
- **Progress tracking** and summary preview
- **IndexedDB storage** for large image files
- **Smart storage management** with automatic cleanup

### 📋 Campaign Management
- **Browse all campaigns** with filtering and sorting
- **Search functionality** across campaign titles and descriptions
- **Category filtering** (Technology, Health, Education, etc.)
- **Responsive card layout** with campaign stats
- **Progress indicators** and funding goals

### 🤝 Support System
- **Multi-step support form** (3 steps)
- **Flexible contribution amounts** with currency support
- **Anonymous donation** toggle option
- **Cryptocurrency payments** (Bitcoin, Ethereum, Solana)
- **Wallet address display** with copy functionality
- **QR code placeholders** for easy payments

### 🖼️ Image Gallery
- **Interactive image modal** with full-screen view
- **Navigation arrows** for multiple images
- **Keyboard controls** (arrow keys, escape)
- **Mobile-responsive** touch controls
- **Image optimization** and fallback handling

### 💾 Advanced Storage
- **Hybrid storage approach**:
  - Campaign metadata → localStorage (fast access)
  - Images → IndexedDB (large capacity)
- **Storage quota management** with graceful fallbacks
- **Automatic cleanup** of old campaigns when needed
- **Cross-page data persistence**

## 🏗️ Project Structure

```
Fundr Project/
├── index.html              # Homepage
├── campaign.html            # Campaign creation form
├── campaign.js             # Campaign creation logic
├── campaign.css            # Campaign form styles
├── Funding.html            # Browse campaigns page
├── funding.js              # Campaign listing & filtering
├── funding.css             # Campaign cards & layout
├── support.html            # Support project form
├── support.js              # Support form logic
├── support.css             # Support form styles
├── showcase.html           # Project showcase
├── howitworks.html         # How it works page
├── aboutus.html            # About us page
├── style.css               # Global styles
├── nav.js                  # Navigation functionality
└── img1.png                # Default campaign image
```


### Quick Start

1. **Browse existing campaigns** on the homepage
2. **Create a new campaign** using the "Start a Campaign" button
3. **Upload images** and fill in campaign details
4. **Publish your campaign** to make it live
5. **Support projects** by clicking "Support This Project"

## 🎮 User Guide

### Creating a Campaign

1. **Step 1: Basic Information**
   - Campaign title and tagline
   - Category selection
   - Location and description

2. **Step 2: Funding Details**
   - Target amount and currency
   - Minimum contribution
   - Campaign deadline
   - Preferred cryptocurrency

3. **Step 3: Rewards (Optional)**
   - Reward tiers for backers
   - Quantity limits
   - Delivery information

4. **Step 4: Media Upload**
   - Cover image upload
   - Gallery images (up to 5)
   - Image preview and management

5. **Step 5: Company Profile**
   - Company information
   - Website and industry
   - Location details

6. **Step 6: Payment & Review**
   - Wallet addresses
   - Campaign summary
   - Final review and publish

### Supporting a Campaign

1. **Choose contribution amount**
2. **Enter your information** (or donate anonymously)
3. **Select payment method** (BTC, ETH, SOL)
4. **Copy wallet address** and send payment
5. **Confirm your support**

### Browsing Campaigns

- **Filter by category** using the top navigation tabs
- **Sort campaigns** by newest, oldest, most funded, etc.
- **Search campaigns** using the search bar
- **View campaign details** by clicking "Support This Project"

## 🔧 Technical Details

### Storage Architecture

