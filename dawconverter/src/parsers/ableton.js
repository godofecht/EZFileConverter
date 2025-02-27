const alsParser = require('als-parser');
const { DAWProject, Track, Clip, Plugin } = require('dawproject');

async function parseAbletonProject(buffer) {
    try {
        // Parse the Ableton project using als-parser
        const alsProject = await alsParser.parse(buffer);
        
        // Convert to DAWProject format
        const project = new DAWProject({
            name: alsProject.name,
            author: alsProject.creator,
            tempo: alsProject.tempo,
            timeSignature: {
                numerator: alsProject.timeSignature[0],
                denominator: alsProject.timeSignature[1]
            }
        });

        // Convert tracks
        alsProject.tracks.forEach(alsTrack => {
            const track = new Track({
                name: alsTrack.name,
                type: convertTrackType(alsTrack.type),
                color: alsTrack.color,
                isMuted: alsTrack.muted,
                isSoloed: alsTrack.soloed,
                volume: alsTrack.volume,
                pan: alsTrack.pan
            });

            // Convert clips
            alsTrack.clips.forEach(alsClip => {
                const clip = new Clip({
                    name: alsClip.name,
                    startTime: alsClip.startTime,
                    duration: alsClip.duration,
                    startOffset: alsClip.startOffset,
                    isLooping: alsClip.looping,
                    content: alsClip.content // MIDI data or audio file reference
                });
                track.addClip(clip);
            });

            // Convert devices/plugins
            alsTrack.devices.forEach(device => {
                const plugin = new Plugin({
                    name: device.name,
                    type: device.type,
                    manufacturer: device.manufacturer,
                    parameters: device.parameters
                });
                track.addPlugin(plugin);
            });

            project.addTrack(track);
        });

        // Add automation data
        alsProject.automation.forEach(auto => {
            project.addAutomation({
                target: auto.target,
                points: auto.points
            });
        });

        // Add routing information
        project.setRouting({
            inputs: alsProject.routing.inputs,
            outputs: alsProject.routing.outputs,
            sends: alsProject.routing.sends
        });

        return project;
    } catch (error) {
        console.error('Error parsing Ableton project:', error);
        throw error;
    }
}

function convertTrackType(abletonType) {
    const typeMap = {
        'MidiTrack': 'midi',
        'AudioTrack': 'audio',
        'ReturnTrack': 'aux',
        'GroupTrack': 'group',
        'MasterTrack': 'master'
    };
    return typeMap[abletonType] || 'unknown';
}

module.exports = { parseAbletonProject }; 