# Product Requirement Document: Jisort Dishi

## 1. Product Overview
**Summary:**
An AI-powered app that suggests meals and recipes based on how much money a user has, while also tracking what’s already in their fridge or pantry. It helps users decide what to cook, reduces food waste with reminders, and offers a recipe marketplace where people can earn from sharing their meals. The platform also supports healthier living through simple diet and exercise guidance.

**Target Users:**
Students, bachelors, and budget-conscious individuals who struggle to decide what to eat, manage limited funds, or make use of what they already have at home.

**Core Value Proposition:**
Helps users save money, reduce food waste, and make better daily food choices by combining budget-based meal suggestions, pantry tracking, and accessible recipes in one simple platform.

## 2. Objectives & Success Metrics
**Business Objectives:**
- Help users make affordable daily meal decisions based on their budget.
- Reduce food waste by encouraging use of existing pantry/fridge items.
- Build a strong user base among students and budget-conscious individuals.
- Create a revenue stream through recipe monetization and platform commissions.
- Promote healthier lifestyles through diet and simple exercise guidance.

**Measurable KPIs:**
- Monthly active users (MAU) and daily active users (DAU).
- Number of meal suggestions generated and used per user.
- Reduction in reported food waste.
- Average user spending on meals before vs after using the app.
- Number of recipes uploaded, purchased, and monetized.
- Conversion rate from free users to paying users.
- User retention rate.
- Engagement with health features.

## 3. User Personas
1. **Campus Student (Brian, 21):** Goals: Eat affordable meals, avoid skipping meals, save money.
2. **Young Professional (Aisha, 27):** Goals: Eat healthy, save time, manage groceries efficiently.
3. **Budget-Conscious Bachelor (Kevin, 24):** Goals: Cook easy meals, avoid eating out, stay within budget.
4. **Home Cook / Recipe Creator (Mary, 30):** Goals: Share recipes, earn income, grow audience.

## 4. Use Cases / User Stories
- As a student, I want to enter how much money I have, so that I can get meal suggestions I can afford.
- As a user, I want to see recipes based on what’s in my fridge, so that I can avoid wasting food.
- As a user, I want to track items in my pantry, so that I know what I already have at home.
- As a user, I want to receive reminders before food expires, so that I can use it in time.
- As a creator, I want to upload and sell my recipes, so that I can earn income.

## 5. Scope (v1 features)
**In-Scope:**
- Budget-based meal suggestions.
- Basic recipe library.
- Pantry/fridge tracking (manual input).
- Expiry reminders.
- User accounts.
- Simple health tips.
- Recipe upload feature.

**Out-of-Scope:**
- Full recipe marketplace with payments.
- Advanced AI personalization.
- Automated grocery store integration.
- Social features (comments, likes).

## 6. Functional Requirements
- **Authentication:** Sign up/Login (Email, Phone, Social).
- **Dashboard:** Budget input, quick suggestions, pantry overview.
- **Core Features:** Suggestion engine, recipe browsing, pantry tracking, expiry alerts.
- **Integrations:** Mobile money (M-Pesa) for budget tracking, Gemini AI for suggestions.
- **Notifications:** Expiry alerts, daily meal tips.

## 7. Non-Functional Requirements
- **Performance:** Load in <3s, suggestions in <2s.
- **Security:** Encrypted data, secure auth.
- **Reliability:** 99% uptime.
- **UX:** Mobile-first, low literacy support (icons).

## 8. Data Model
- **User:** id, preferences, budget.
- **Storage:** id, user_id, type (fridge/pantry).
- **Item:** id, storage_id, user_id, name, quantity, expiry.
- **Recipe:** id, title, ingredients, steps, cost, created_by.
- **MealSuggestion:** id, user_id, recipe_id, budget_used.

## 9. Risks & Assumptions
- **Risks:** Inaccurate user input, low adoption, AI hallucinations.
- **Assumptions:** Users have smartphones and seek budget solutions.

## 10. AI Instructions
AI should enable meal suggestions based on the union of "available pantry items" and "current budget", optimizing for cost and nutritional value.
