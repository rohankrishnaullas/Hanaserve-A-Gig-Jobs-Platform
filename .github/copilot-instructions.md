# GitHub Copilot Instructions - Gig Jobs App

## Critical Workflow Rules

### Always Validate Compilation After Code Changes

**MANDATORY**: After making any code changes to this project:

1. **Stop existing server**: Check if port 3000 is in use, stop the running server
2. **Start the app**: Run `npm start` in the project directory
3. **Verify compilation**: Ensure "Compiled successfully!" message appears
4. **Check for errors**: Review terminal output for any compilation or runtime errors
5. **Test in browser**: If applicable, verify the change works as expected

### Command Pattern
```powershell
# Stop server if running on port 3000, then start
cd "C:\Users\rohanullas\Downloads\09 Fusion and Kid Buu Sagas ( Updated on 20-07-21 )\App\Code\gig-jobs-app"
npm start
```


### Git Operations Policy
- **Never attempt to perform a `git merge` automatically.**
- You may use `git add`, `git commit`, `git push`, `git pull`, etc., but do **not** perform merges.

### When to Apply
- After editing any `.js`, `.jsx`, `.ts`, `.tsx` files
- After modifying any service files
- After changing configuration files
- After updating dependencies
- Before marking any task as complete

### Exception
Skip this step only for:
- Documentation-only changes (README, .md files)
- Configuration files that don't affect compilation (.env, .gitignore)

## Project-Specific Guidelines

### Gig Jobs App
- This is a gig economy platform connecting job requesters with service providers
- Now includes voice-enabled AI conversation functionality using Azure OpenAI and Azure Speech Services
- Voice experience must be fluid like Microsoft Copilot voice mode
- Test voice functionality after any changes to speech or conversation logic
- Ensure all existing features continue to work after integrating new functionality

### Communication Guidelines
**IMPORTANT**: When implementing changes or new features:
- If any part of the user's request is unclear or ambiguous, **ASK FOR CLARIFICATION** before implementing
- If multiple implementation approaches are possible, **PRESENT OPTIONS** and ask which the user prefers
- If requirements seem incomplete, **ASK SPECIFIC QUESTIONS** to gather missing details
- Never assume or guess - confirm your understanding first
- When integrating features from other projects, confirm the integration approach

### Key Features to Preserve
- Job requester flow (posting gig jobs)
- Service provider flow (browsing and accepting jobs)
- Voice recording and transcription
- Job matching algorithm
- Community features
- Notifications system
- Voice-enabled AI conversation (newly integrated)

### Architecture Notes
- React-based frontend
- Local storage for data persistence
- Azure Speech Services for voice capabilities
- Azure OpenAI for conversational AI
- Component-based structure with separation of concerns
