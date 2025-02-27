const flpParser = require('flp-parser');
const { DAWProject, Track, Clip, Plugin } = require('dawproject');
const midiFile = require('midi-file');

async function parseFlStudioProject(buffer) {
    try {
        // Parse the FL Studio project using flp-parser
        const flpData = await flpParser.parse(buffer);
        
        // Create a new DAWProject
        const project = new DAWProject({
            name: flpData.projectTitle || 'Untitled',
            tempo: flpData.tempo,
            timeSignature: {
                numerator: flpData.timeSignature?.[0] || 4,
                denominator: flpData.timeSignature?.[1] || 4
            }
        });

        // Convert channels (instruments)
        flpData.channels.forEach(channel => {
            const track = new Track({
                name: channel.name || `Channel ${channel.index}`,
                type: getChannelType(channel),
                color: channel.color,
                isMuted: channel.muted,
                isSoloed: channel.solo,
                volume: channel.volume,
                pan: channel.panning
            });

            // Convert patterns to clips
            channel.patterns.forEach(pattern => {
                if (pattern.notes && pattern.notes.length > 0) {
                    // Convert FL Studio pattern to MIDI
                    const midiData = convertPatternToMIDI(pattern);
                    
                    const clip = new Clip({
                        name: pattern.name || `Pattern ${pattern.index}`,
                        startTime: pattern.position,
                        duration: pattern.length,
                        content: midiData
                    });
                    track.addClip(clip);
                }
            });

            // Convert VST/effects plugins
            channel.plugins.forEach(plugin => {
                const dawPlugin = new Plugin({
                    name: plugin.name,
                    type: plugin.type,
                    manufacturer: plugin.manufacturer,
                    parameters: convertPluginParams(plugin.parameters)
                });
                track.addPlugin(dawPlugin);
            });

            // Add automation
            if (channel.automation) {
                channel.automation.forEach(auto => {
                    track.addAutomation({
                        target: auto.parameter,
                        points: auto.points.map(point => ({
                            time: point.position,
                            value: point.value,
                            curve: point.tension
                        }))
                    });
                });
            }

            project.addTrack(track);
        });

        // Convert mixer tracks
        flpData.mixer.tracks.forEach(mixerTrack => {
            const track = new Track({
                name: mixerTrack.name || `Mixer Track ${mixerTrack.index}`,
                type: 'aux',
                volume: mixerTrack.volume,
                pan: mixerTrack.panning
            });

            // Add mixer effects
            mixerTrack.effects.forEach(effect => {
                const plugin = new Plugin({
                    name: effect.name,
                    type: 'effect',
                    parameters: convertPluginParams(effect.parameters)
                });
                track.addPlugin(plugin);
            });

            project.addTrack(track);
        });

        // Set up routing
        project.setRouting({
            sends: flpData.mixer.sends,
            outputs: flpData.mixer.outputs
        });

        return project;
    } catch (error) {
        console.error('Error parsing FL Studio project:', error);
        throw error;
    }
}

function getChannelType(channel) {
    if (channel.type === 'sampler') return 'audio';
    if (channel.type === 'generator') return 'midi';
    return channel.type;
}

function convertPatternToMIDI(pattern) {
    // Convert FL Studio pattern to MIDI format
    const midiData = {
        header: {
            format: 0,
            numTracks: 1,
            ticksPerBeat: 960
        },
        tracks: [[]]
    };

    // Convert notes
    pattern.notes.forEach(note => {
        // Note on event
        midiData.tracks[0].push({
            deltaTime: note.position,
            type: 'noteOn',
            channel: 0,
            noteNumber: note.key,
            velocity: note.velocity
        });

        // Note off event
        midiData.tracks[0].push({
            deltaTime: note.position + note.length,
            type: 'noteOff',
            channel: 0,
            noteNumber: note.key,
            velocity: 0
        });
    });

    // Sort events by time
    midiData.tracks[0].sort((a, b) => a.deltaTime - b.deltaTime);

    // Convert to binary MIDI data
    return midiFile.writeMidi(midiData);
}

function convertPluginParams(params) {
    return Object.entries(params).map(([name, value]) => ({
        name,
        value: typeof value === 'object' ? value.value : value,
        normalized: typeof value === 'object' ? value.normalized : true
    }));
}

module.exports = { parseFlStudioProject }; 